// Auto-generated snippet from: apps/forestry4-docs/src/examples/shopping-cart/store-actions.ts
// Description: Shopping cart store actions with validation and transaction handling
// Last synced: Sun Sep 21 14:32:36 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

const createShoppingCartStore = () => new Forest<CartState>({
  name: 'shopping-cart',
  value: initialCartState,
  schema: ShoppingCartSchema,
  tests: cartTests,
  
  actions: {
    // Add item with validation
    addItem: function(value: CartState, product: Product) {
      const existingItem = value.items.find(item => item.id === product.id);
      
      if (existingItem) {
        this.$.updateQuantity(product.id, existingItem.quantity + 1);
      } else {
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          category: product.category,
        };
        
        this.mutate(draft => {
          draft.items.push(newItem);
        });
        this.$.recalculateTotal();
      }
    },
    
    // Update quantity with validation
    updateQuantity: function(value: CartState, productId: string, quantity: number) {
      if (quantity <= 0) {
        this.$.removeItem(productId);
        return;
      }
      
      this.mutate(draft => {
        const item = draft.items.find(item => item.id === productId);
        if (item) {
          item.quantity = quantity;
        }
      });
      this.$.recalculateTotal();
    },
    
    // Apply coupon with validation
    applyCoupon: function(value: CartState, couponCode: string) {
      const coupon = validateCoupon(couponCode, value.subtotal);
      if (!coupon.valid) {
        throw new Error(coupon.error);
      }
      
      this.mutate(draft => {
        draft.couponCode = couponCode;
        draft.discount = coupon.discount;
      });
      this.$.recalculateTotal();
    },
    
    // Recalculate totals
    recalculateTotal: function(value: CartState) {
      const subtotal = value.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      const tax = subtotal * 0.08; // 8% tax
      const shipping = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
      const total = subtotal + tax + shipping - value.discount;
      
      this.mutate(draft => {
        draft.subtotal = subtotal;
        draft.tax = tax;
        draft.shipping = shipping;
        draft.total = Math.max(0, total);
      });
    },
    
    // Checkout with transaction
    checkout: function(value: CartState) {
      return this.transact({
        suspendValidation: false, // Keep validation active
        action() {
          // Validate final state
          const validation = this.validate(this.value);
          if (!validation.isValid) {
            throw new Error(`Checkout failed: ${validation.error}`);
          }
          
          // Process payment, update inventory, etc.
          this.$.processPayment();
          this.$.updateInventory();
          this.$.clearCart();
        }
      });
    }
  }
});
