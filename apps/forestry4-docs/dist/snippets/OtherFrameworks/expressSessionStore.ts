// Express Session Store with Forestry
import express, { Request, Response, NextFunction } from 'express';
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

// Session state interface
interface SessionState {
  sessionId: string;
  userId: string | null;
  userData: {
    username: string;
    email: string;
    role: 'user' | 'admin' | 'moderator';
    lastActivity: number;
  } | null;
  cart: CartItem[];
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
  activity: ActivityLog[];
  createdAt: number;
  expiresAt: number;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface ActivityLog {
  timestamp: number;
  action: string;
  details: Record<string, any>;
}

// Validation schema
const SessionStateSchema = z.object({
  sessionId: z.string().min(1),
  userId: z.string().nullable(),
  userData: z.object({
    username: z.string(),
    email: z.string().email(),
    role: z.enum(['user', 'admin', 'moderator']),
    lastActivity: z.number(),
  }).nullable(),
  cart: z.array(z.object({
    productId: z.number(),
    name: z.string(),
    price: z.number().min(0),
    quantity: z.number().min(1),
  })),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    language: z.string(),
    notifications: z.boolean(),
  }),
  activity: z.array(z.object({
    timestamp: z.number(),
    action: z.string(),
    details: z.record(z.any()),
  })),
  createdAt: z.number(),
  expiresAt: z.number(),
});

// Session store class
class SessionStore extends Forest<SessionState> {
  constructor(sessionId: string, ttl: number = 24 * 60 * 60 * 1000) { // 24 hours default
    const now = Date.now();
    
    super({
      name: `session-${sessionId}`,
      value: {
        sessionId,
        userId: null,
        userData: null,
        cart: [],
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true,
        },
        activity: [],
        createdAt: now,
        expiresAt: now + ttl,
      },
      schema: SessionStateSchema,
    });
  }

  // Authentication actions
  login(userData: SessionState['userData']): void {
    this.mutate(draft => {
      draft.userId = userData?.username || null;
      draft.userData = userData;
    });
    
    this.logActivity('login', { userId: userData?.username });
  }

  logout(): void {
    const userId = this.value.userId;
    
    this.mutate(draft => {
      draft.userId = null;
      draft.userData = null;
      draft.cart = []; // Clear cart on logout
    });
    
    this.logActivity('logout', { userId });
  }

  // Cart actions
  addToCart(item: CartItem): void {
    this.mutate(draft => {
      const existingItem = draft.cart.find(cartItem => cartItem.productId === item.productId);
      
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        draft.cart.push(item);
      }
    });
    
    this.logActivity('add_to_cart', { productId: item.productId, quantity: item.quantity });
  }

  removeFromCart(productId: number): void {
    this.mutate(draft => {
      draft.cart = draft.cart.filter(item => item.productId !== productId);
    });
    
    this.logActivity('remove_from_cart', { productId });
  }

  updateCartQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.mutate(draft => {
      const item = draft.cart.find(cartItem => cartItem.productId === productId);
      if (item) {
        item.quantity = quantity;
      }
    });
    
    this.logActivity('update_cart_quantity', { productId, quantity });
  }

  clearCart(): void {
    this.mutate(draft => {
      draft.cart = [];
    });
    
    this.logActivity('clear_cart', {});
  }

  // Preferences actions
  updatePreferences(preferences: Partial<SessionState['preferences']>): void {
    this.mutate(draft => {
      Object.assign(draft.preferences, preferences);
    });
    
    this.logActivity('update_preferences', preferences);
  }

  // Session management
  extend(additionalTime: number = 30 * 60 * 1000): void { // 30 minutes default
    this.mutate(draft => {
      draft.expiresAt = Math.max(draft.expiresAt, Date.now()) + additionalTime;
    });
    
    this.logActivity('session_extended', { additionalTime });
  }

  touch(): void {
    if (this.value.userData) {
      this.mutate(draft => {
        if (draft.userData) {
          draft.userData.lastActivity = Date.now();
        }
      });
    }
  }

  // Activity logging
  private logActivity(action: string, details: Record<string, any>): void {
    this.mutate(draft => {
      draft.activity.push({
        timestamp: Date.now(),
        action,
        details,
      });
      
      // Keep only last 100 activities
      if (draft.activity.length > 100) {
        draft.activity = draft.activity.slice(-100);
      }
    });
  }

  // Getters
  get isAuthenticated(): boolean {
    return this.value.userId !== null;
  }

  get isExpired(): boolean {
    return Date.now() > this.value.expiresAt;
  }

  get cartTotal(): number {
    return this.value.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  get cartItemCount(): number {
    return this.value.cart.reduce((count, item) => count + item.quantity, 0);
  }

  get recentActivity(): ActivityLog[] {
    return this.value.activity.slice(-10); // Last 10 activities
  }
}

// Session manager
class SessionManager {
  private sessions = new Map<string, SessionStore>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired sessions every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  getSession(sessionId: string): SessionStore {
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      session = new SessionStore(sessionId);
      this.sessions.set(sessionId, session);
    } else if (session.isExpired) {
      // Create new session if expired
      this.sessions.delete(sessionId);
      session = new SessionStore(sessionId);
      this.sessions.set(sessionId, session);
    } else {
      // Touch session to update last activity
      session.touch();
    }
    
    return session;
  }

  destroySession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.isExpired) {
        expiredSessions.push(sessionId);
      }
    }
    
    expiredSessions.forEach(sessionId => {
      this.sessions.delete(sessionId);
    });
    
    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  get activeSessionCount(): number {
    return this.sessions.size;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.sessions.clear();
  }
}

// Global session manager instance
const sessionManager = new SessionManager();

// Middleware to attach session to request
export const sessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get session ID from cookie or create new one
  let sessionId = req.cookies?.sessionId;
  
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.cookie('sessionId', sessionId, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  // Attach session to request
  req.session = sessionManager.getSession(sessionId);
  
  // Extend session on each request
  req.session.extend();
  
  next();
};

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      session: SessionStore;
    }
  }
}

// Example route handlers using sessions
const router = express.Router();

// Login endpoint
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  // Mock authentication (replace with real auth)
  if (username === 'admin' && password === 'password') {
    req.session.login({
      username,
      email: `${username}@example.com`,
      role: 'admin',
      lastActivity: Date.now(),
    });
    
    res.json({ 
      message: 'Login successful',
      user: req.session.value.userData,
      sessionId: req.session.value.sessionId,
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  req.session.logout();
  res.json({ message: 'Logout successful' });
});

// Cart endpoints
router.post('/cart/add', (req: Request, res: Response) => {
  const { productId, name, price, quantity } = req.body;
  
  req.session.addToCart({ productId, name, price, quantity });
  
  res.json({
    message: 'Item added to cart',
    cart: req.session.value.cart,
    total: req.session.cartTotal,
  });
});

router.get('/cart', (req: Request, res: Response) => {
  res.json({
    cart: req.session.value.cart,
    total: req.session.cartTotal,
    itemCount: req.session.cartItemCount,
  });
});

// Session info endpoint
router.get('/session', (req: Request, res: Response) => {
  res.json({
    sessionId: req.session.value.sessionId,
    isAuthenticated: req.session.isAuthenticated,
    user: req.session.value.userData,
    preferences: req.session.value.preferences,
    cartItemCount: req.session.cartItemCount,
    recentActivity: req.session.recentActivity,
    expiresAt: req.session.value.expiresAt,
  });
});

export { sessionManager, SessionStore };
export default router;
