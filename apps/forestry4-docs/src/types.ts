// Shopping Cart Example - Simple validation for business logic
export interface Product {
  id: string;
  name: string;
  price: number;
  inStock: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface ShoppingCart {
  items: CartItem[];
  totalCost: number;
}

// Advanced Form Example - Using Branches for field management
export interface FormField<T = any> {
  value: T;
  isValid: boolean;
  errorString: string;
}

export interface AdvancedForm {
  username: FormField<string>;
  email: FormField<string>;
  age: FormField<number>;
  isSubmitting: boolean;
  canSubmit: boolean;
  submitError: string;
}
