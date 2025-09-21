// Auto-generated snippet from: apps/forestry4-docs/src/examples/form-validation/UserRegistrationSchema.ts
// Description: Comprehensive Zod schema for user registration form with complex validation rules
// Last synced: Sat Sep 20 18:53:39 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { z } from 'zod';

const UserRegistrationSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
    
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
    
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
    
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
    
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
    
  age: z.number()
    .int('Age must be a whole number')
    .min(13, 'Must be at least 13 years old')
    .max(120, 'Please enter a valid age'),
    
  agreeToTerms: z.boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
    
  newsletter: z.boolean().optional(),
  
  // Conditional field - required if newsletter is true
  interests: z.array(z.string()).optional(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
).refine(
  (data) => !data.newsletter || (data.interests && data.interests.length > 0),
  {
    message: "Please select at least one interest for newsletter",
    path: ["interests"],
  }
);

export default UserRegistrationSchema;
