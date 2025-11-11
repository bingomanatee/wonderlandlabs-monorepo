// Express Middleware with Forestry
import express, { Request, Response, NextFunction } from 'express';
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

// Request state interface
interface RequestState {
  userId: string | null;
  sessionId: string;
  startTime: number;
  requestCount: number;
  errors: string[];
  metadata: Record<string, any>;
}

// Validation schema
const RequestStateSchema = z.object({
  userId: z.string().nullable(),
  sessionId: z.string().min(1),
  startTime: z.number(),
  requestCount: z.number().min(0),
  errors: z.array(z.string()),
  metadata: z.record(z.any()),
});

// Extend Express Request to include our store
declare global {
  namespace Express {
    interface Request {
      store: RequestStore;
    }
  }
}

class RequestStore extends Forest<RequestState> {
  constructor(sessionId: string) {
    super({
      name: `request-store-${sessionId}`,
      value: {
        userId: null,
        sessionId,
        startTime: Date.now(),
        requestCount: 0,
        errors: [],
        metadata: {},
      },
      schema: RequestStateSchema,
    });
  }

  // Actions
  setUserId(userId: string): void {
    this.set('userId', userId);
  }

  incrementRequestCount(): void {
    this.mutate(draft => {
      draft.requestCount += 1;
    });
  }

  addError(error: string): void {
    this.mutate(draft => {
      draft.errors.push(error);
    });
  }

  setMetadata(key: string, value: any): void {
    this.mutate(draft => {
      draft.metadata[key] = value;
    });
  }

  clearErrors(): void {
    this.set('errors', []);
  }

  // Getters
  get duration(): number {
    return Date.now() - this.value.startTime;
  }

  get hasErrors(): boolean {
    return this.value.errors.length > 0;
  }

  get isAuthenticated(): boolean {
    return this.value.userId !== null;
  }
}

// Middleware to attach Forestry store to request
export const forestryMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Generate or get session ID
  const sessionId = req.sessionID || req.headers['x-session-id'] as string || 
                   `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create store for this request
  req.store = new RequestStore(sessionId);

  // Increment request count
  req.store.incrementRequestCount();

  // Add request metadata
  req.store.setMetadata('method', req.method);
  req.store.setMetadata('url', req.url);
  req.store.setMetadata('userAgent', req.headers['user-agent']);
  req.store.setMetadata('ip', req.ip);

  // Subscribe to store changes for logging
  const subscription = req.store.$subject.subscribe(state => {
    console.log(`[${sessionId}] State updated:`, {
      userId: state.userId,
      requestCount: state.requestCount,
      errors: state.errors.length,
      duration: req.store.duration,
    });
  });

  // Clean up subscription when response finishes
  res.on('finish', () => {
    subscription.unsubscribe();
    
    // Log final state
    console.log(`[${sessionId}] Request completed:`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: req.store.duration,
      errors: req.store.value.errors,
      requestCount: req.store.value.requestCount,
    });
  });

  next();
};

// Authentication middleware using Forestry store
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    req.store.addError('No authorization token provided');
    return res.status(401).json({ 
      error: 'Unauthorized',
      sessionId: req.store.value.sessionId 
    });
  }

  try {
    // Mock token validation (replace with real JWT validation)
    const userId = validateToken(token);
    req.store.setUserId(userId);
    req.store.setMetadata('authMethod', 'bearer-token');
    next();
  } catch (error) {
    req.store.addError(`Authentication failed: ${error.message}`);
    res.status(401).json({ 
      error: 'Invalid token',
      sessionId: req.store.value.sessionId 
    });
  }
};

// Error handling middleware
export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  req.store.addError(error.message);
  req.store.setMetadata('errorStack', error.stack);

  const statusCode = error.name === 'ValidationError' ? 400 : 500;
  
  res.status(statusCode).json({
    error: error.message,
    sessionId: req.store.value.sessionId,
    requestCount: req.store.value.requestCount,
    duration: req.store.duration,
  });
};

// Rate limiting middleware using Forestry
const rateLimitStores = new Map<string, Forest<{ requests: number; resetTime: number }>>();

export const rateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    let rateLimitStore = rateLimitStores.get(clientId);
    
    if (!rateLimitStore) {
      rateLimitStore = new Forest({
        name: `rate-limit-${clientId}`,
        value: { requests: 0, resetTime: now + windowMs },
      });
      rateLimitStores.set(clientId, rateLimitStore);
    }

    // Reset if window has passed
    if (now > rateLimitStore.value.resetTime) {
      rateLimitStore.mutate(draft => {
        draft.requests = 0;
        draft.resetTime = now + windowMs;
      });
    }

    // Check rate limit
    if (rateLimitStore.value.requests >= maxRequests) {
      req.store.addError('Rate limit exceeded');
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((rateLimitStore.value.resetTime - now) / 1000),
        sessionId: req.store.value.sessionId,
      });
    }

    // Increment request count
    rateLimitStore.mutate(draft => {
      draft.requests += 1;
    });

    req.store.setMetadata('rateLimitRequests', rateLimitStore.value.requests);
    req.store.setMetadata('rateLimitMax', maxRequests);

    next();
  };
};

// Mock token validation function
function validateToken(token: string): string {
  if (token === 'valid-token') {
    return 'user-123';
  }
  throw new Error('Invalid token');
}

// Example usage:
/*
const app = express();

app.use(forestryMiddleware);
app.use(rateLimitMiddleware(100, 60000)); // 100 requests per minute

app.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Protected resource accessed',
    userId: req.store.value.userId,
    sessionId: req.store.value.sessionId,
    requestCount: req.store.value.requestCount,
  });
});

app.use(errorMiddleware);
*/
