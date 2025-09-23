// Auto-generated snippet from: apps/forestry4-docs/src/examples/schema-validation/schemaPrepIntegration.ts
// Description: Schema prep integration with custom validation logic
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Schema Prep Integration with Custom Validation
import { z } from 'zod';
import { Forest } from '@wonderlandlabs/forestry';

// Define comprehensive schema
const ProductSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
  name: z.string().min(1, 'Product name is required'),
  price: z.number().positive('Price must be positive'),
  category: z.enum(['electronics', 'clothing', 'books', 'home']),
  inStock: z.boolean(),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed'),
  metadata: z.object({
    weight: z.number().positive().optional(),
    dimensions: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive()
    }).optional()
  }).optional()
});

class ProductForest extends Forest {
  constructor() {
    super({
      id: '',
      name: '',
      price: 0,
      category: 'electronics' as const,
      inStock: false,
      tags: [],
      metadata: {}
    }, {
      name: 'ProductStore',
      schema: ProductSchema,
      
      // Custom prep function for additional validation
      prep: (value) => {
        // Schema validation happens first
        const schemaResult = ProductSchema.safeParse(value);
        if (!schemaResult.success) {
          throw new Error(`Schema validation failed: ${schemaResult.error.message}`);
        }

        // Additional business logic validation
        if (value.price > 10000 && value.category === 'books') {
          throw new Error('Books cannot cost more than $10,000');
        }

        if (value.tags.length > 0 && !value.tags.every(tag => tag.length > 0)) {
          throw new Error('All tags must be non-empty strings');
        }

        // Return validated value
        return schemaResult.data;
      }
    });
  }

  updateProduct(updates: Partial<typeof this.value>) {
    this.next({ ...this.value, ...updates });
  }

  addTag(tag: string) {
    if (this.value.tags.includes(tag)) {
      throw new Error('Tag already exists');
    }
    
    this.next({
      ...this.value,
      tags: [...this.value.tags, tag]
    });
  }

  setPrice(price: number) {
    this.next({ ...this.value, price });
  }
}

// Usage examples
const productStore = new ProductForest();

// Valid update
productStore.updateProduct({
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Laptop',
  price: 999.99,
  category: 'electronics',
  inStock: true,
  tags: ['portable', 'gaming']
});

// This will fail business logic validation
try {
  productStore.updateProduct({
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Expensive Book',
    price: 15000, // Too expensive for a book
    category: 'books',
    inStock: true
  });
} catch (error) {
  console.error('Validation failed:', error.message);
}
