// Auto-generated snippet from: apps/forestry4-docs/src/examples/schema-validation/conditionalLogic.ts
// Description: Conditional validation logic and discriminated unions
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Conditional Logic and Advanced Schema Patterns
import { z } from 'zod';
import { Forest } from '@wonderlandlabs/forestry';

// Discriminated union for different user types
const BaseUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email()
});

const RegularUserSchema = BaseUserSchema.extend({
  type: z.literal('regular'),
  subscription: z.enum(['free', 'premium']).default('free')
});

const AdminUserSchema = BaseUserSchema.extend({
  type: z.literal('admin'),
  permissions: z.array(z.string()).min(1, 'Admin must have at least one permission'),
  department: z.string().min(1)
});

const BusinessUserSchema = BaseUserSchema.extend({
  type: z.literal('business'),
  companyName: z.string().min(1),
  taxId: z.string().optional(),
  billingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    zipCode: z.string().min(1)
  })
});

// Discriminated union
const UserSchema = z.discriminatedUnion('type', [
  RegularUserSchema,
  AdminUserSchema,
  BusinessUserSchema
]);

// Conditional validation based on other fields
const PaymentSchema = z.object({
  method: z.enum(['credit_card', 'paypal', 'bank_transfer']),
  amount: z.number().positive(),
  
  // Conditional fields based on payment method
  creditCard: z.object({
    number: z.string().regex(/^\d{16}$/, 'Credit card must be 16 digits'),
    expiryMonth: z.number().min(1).max(12),
    expiryYear: z.number().min(new Date().getFullYear()),
    cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3-4 digits')
  }).optional(),
  
  paypalEmail: z.string().email().optional(),
  
  bankAccount: z.object({
    routingNumber: z.string().regex(/^\d{9}$/, 'Routing number must be 9 digits'),
    accountNumber: z.string().min(8).max(17)
  }).optional()
}).refine((data) => {
  // Conditional validation: require specific fields based on payment method
  if (data.method === 'credit_card' && !data.creditCard) {
    return false;
  }
  if (data.method === 'paypal' && !data.paypalEmail) {
    return false;
  }
  if (data.method === 'bank_transfer' && !data.bankAccount) {
    return false;
  }
  return true;
}, {
  message: 'Payment details must match the selected payment method'
});

// Schema with conditional logic using transform and refine
const OrderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number().positive(),
    price: z.number().positive()
  })).min(1),
  
  shippingMethod: z.enum(['standard', 'express', 'overnight']),
  
  // Conditional shipping address (required for physical items)
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    zipCode: z.string().min(1)
  }).optional(),
  
  // Discount code with conditional validation
  discountCode: z.string().optional(),
  
  // Customer type affects validation
  customerType: z.enum(['individual', 'business']),
  businessInfo: z.object({
    companyName: z.string().min(1),
    taxId: z.string().min(1)
  }).optional()
}).refine((data) => {
  // Business customers must provide business info
  if (data.customerType === 'business' && !data.businessInfo) {
    return false;
  }
  return true;
}, {
  message: 'Business customers must provide company information'
}).refine((data) => {
  // Express and overnight shipping require address
  if (['express', 'overnight'].includes(data.shippingMethod) && !data.shippingAddress) {
    return false;
  }
  return true;
}, {
  message: 'Express and overnight shipping require a shipping address'
});

class ConditionalForest extends Forest {
  constructor() {
    super({
      user: null as z.infer<typeof UserSchema> | null,
      payment: null as z.infer<typeof PaymentSchema> | null,
      order: null as z.infer<typeof OrderSchema> | null
    }, {
      name: 'ConditionalStore',
      schema: z.object({
        user: UserSchema.nullable(),
        payment: PaymentSchema.nullable(),
        order: OrderSchema.nullable()
      })
    });
  }

  createRegularUser(name: string, email: string, subscription: 'free' | 'premium' = 'free') {
    const user = {
      id: crypto.randomUUID(),
      type: 'regular' as const,
      name,
      email,
      subscription
    };

    this.next({ ...this.value, user });
  }

  createAdminUser(name: string, email: string, permissions: string[], department: string) {
    const user = {
      id: crypto.randomUUID(),
      type: 'admin' as const,
      name,
      email,
      permissions,
      department
    };

    this.next({ ...this.value, user });
  }

  createBusinessUser(name: string, email: string, companyName: string, billingAddress: any, taxId?: string) {
    const user = {
      id: crypto.randomUUID(),
      type: 'business' as const,
      name,
      email,
      companyName,
      taxId,
      billingAddress
    };

    this.next({ ...this.value, user });
  }

  setCreditCardPayment(amount: number, cardDetails: any) {
    const payment = {
      method: 'credit_card' as const,
      amount,
      creditCard: cardDetails,
      paypalEmail: undefined,
      bankAccount: undefined
    };

    this.next({ ...this.value, payment });
  }

  setPayPalPayment(amount: number, email: string) {
    const payment = {
      method: 'paypal' as const,
      amount,
      creditCard: undefined,
      paypalEmail: email,
      bankAccount: undefined
    };

    this.next({ ...this.value, payment });
  }
}

// Usage examples
const store = new ConditionalForest();

// Create different user types
store.createRegularUser('John Doe', 'john@example.com', 'premium');

store.createAdminUser('Jane Admin', 'jane@company.com', ['users:read', 'users:write'], 'IT');

store.createBusinessUser('Bob Business', 'bob@business.com', 'Acme Corp', {
  street: '123 Business St',
  city: 'Business City',
  zipCode: '12345'
}, 'TAX123456');

// Set payment with conditional validation
store.setCreditCardPayment(99.99, {
  number: '1234567890123456',
  expiryMonth: 12,
  expiryYear: 2025,
  cvv: '123'
});

store.setPayPalPayment(49.99, 'payment@example.com');
