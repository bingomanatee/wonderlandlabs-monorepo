import { Store } from '@wonderlandlabs/forestry4';
import { ShoppingCart, CartItem } from '@/types.ts';
import { PRODUCTS } from '@/constants.ts';

type ErrorHandler = (error: Error | string, title?: string) => void;

export default function shoppingCartStoreFactory(handleError?: ErrorHandler) {
  return new Store<ShoppingCart>({
    name: 'shopping-cart',
    value: { items: [], totalCost: 0 },
    actions: {
      addItem: function(value: ShoppingCart, productId: string, quantity: number) {
        const existingIndex = value.items.findIndex(item => item.productId === productId)
        let newItems: CartItem[]

        if (existingIndex >= 0) {
          // Update existing item quantity
          newItems = value.items.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        } else {
          // Add new item
          newItems = [...value.items, { productId, quantity }]
        }

        this.next({ ...value, items: newItems })
      },

      // Event-centric action that extracts data from click events
      addItemFromEvent: function(value: ShoppingCart, event: React.MouseEvent<HTMLElement>) {
        const element = event.currentTarget
        const productId = element.dataset.productId
        const quantity = parseInt(element.dataset.quantity || '1')

        if (!productId) {
          console.error('addItemFromEvent: missing data-product-id attribute')
          return
        }

        // Delegate to the main addItem action
        this.$.addItem(productId, quantity)
      },
      
      removeItem: function(value: ShoppingCart, productId: string) {
        const newItems = value.items.filter(item => item.productId !== productId)
        this.next({ ...value, items: newItems })
      },
      
      updateQuantity: function(value: ShoppingCart, productId: string, quantity: number) {
        const newItems = value.items.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        )
        this.next({ ...value, items: newItems })
      },

      // Semantic action for updating product quantity from form input
      updateProduct: function(value: ShoppingCart, productId: string, quantity: number) {
        this.$.updateQuantity(productId, quantity)
      },
      
      clearCart: function() {
        this.next({ items: [], totalCost: 0 })
      },

      // Safe actions that catch validation errors and show toasts
      ...(handleError ? {
        safeAddItemFromEvent: function(value: ShoppingCart, event: React.MouseEvent<HTMLElement>) {
          try {
            this.$.addItemFromEvent(event);
          } catch (error) {
            handleError(error as Error, 'Cannot Add Item');
          }
        },

        safeUpdateQuantity: function(value: ShoppingCart, productId: string, quantity: number) {
          try {
            this.$.updateQuantity(productId, quantity);
          } catch (error) {
            handleError(error as Error, 'Cannot Update Quantity');
          }
        },

        safeAddItem: function(value: ShoppingCart, productId: string, quantity: number) {
          try {
            this.$.addItem(productId, quantity);
          } catch (error) {
            handleError(error as Error, 'Cannot Add Item');
          }
        }
      } : {})
    },
    
    prep: function(input: Partial<ShoppingCart>, current: ShoppingCart): ShoppingCart {
      const items = input.items || current.items
      // Calculate total cost in prep function
      const totalCost = items.reduce((sum, item) => {
        const product = PRODUCTS.find(p => p.id === item.productId)
        return sum + (product ? product.price * item.quantity : 0)
      }, 0)

      return { items, totalCost }
    },
    
    tests: [
      // Critical business rule - No duplicate products (quantum constraint)
      (value: ShoppingCart) => {
        const productIds = value.items.map(item => item.productId)
        const uniqueIds = new Set(productIds)
        return productIds.length !== uniqueIds.size 
          ? 'Cannot have the same product multiple times in cart - use quantity instead' 
          : null
      },

      // Critical business rule - No negative or zero quantities (should not be saved)
      (value: ShoppingCart) => {
        const invalidQuantities = value.items.filter(item => 
          item.quantity <= 0
        )
        return invalidQuantities.length > 0 
          ? 'Cart cannot contain items with zero or negative quantities' 
          : null
      },

      // Critical business rule - No non-existent products (referential integrity)
      (value: ShoppingCart) => {
        const invalidItems = value.items.filter(item => 
          !PRODUCTS.find(p => p.id === item.productId)
        )
        return invalidItems.length > 0 
          ? 'Cart contains products that no longer exist' 
          : null
      },

      // Critical business rule - Cannot exceed available stock (inventory constraint)
      (value: ShoppingCart) => {
        const outOfStock = value.items.filter(item => {
          const product = PRODUCTS.find(p => p.id === item.productId)
          return product && item.quantity > product.inStock
        })
        return outOfStock.length > 0 
          ? 'Cannot add more items than available in stock' 
          : null
      },

      // Critical business rule - Total cost must be accurate (financial integrity)
      (value: ShoppingCart) => {
        const expectedTotal = value.items.reduce((sum, item) => {
          const product = PRODUCTS.find(p => p.id === item.productId)
          return sum + (product ? product.price * item.quantity : 0)
        }, 0)
        
        return Math.abs(value.totalCost - expectedTotal) > 0.01 
          ? 'Total cost calculation is incorrect - financial integrity violation' 
          : null
      },

      // Critical business rule - Cart cannot be too large (system constraint)
      (value: ShoppingCart) => {
        const totalItems = value.items.reduce((sum, item) => sum + item.quantity, 0)
        return totalItems > 100 
          ? 'Cart cannot contain more than 100 total items' 
          : null
      }
    ]
  })
}
