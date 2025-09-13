// Mock product catalog - defined outside component to prevent re-creation
import { Product } from '@/types.ts';

export const PRODUCTS: Product[] = [
  { id: 'laptop', name: 'Gaming Laptop', price: 1299.99, inStock: 5 },
  { id: 'mouse', name: 'Wireless Mouse', price: 49.99, inStock: 20 },
  { id: 'keyboard', name: 'Mechanical Keyboard', price: 129.99, inStock: 8 },
];
