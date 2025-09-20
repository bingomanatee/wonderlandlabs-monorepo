// Auto-generated snippet from: apps/forestry4-docs/src/pages/examples/ShoppingCart.tsx
// Description: Shopping cart example page
// Last synced: Sat Sep 20 11:39:50 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Badge,
  Box,
  Alert,
  AlertIcon,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import ShoppingCartDemo from '../../components/ValidationSystem/ShoppingCartDemo';
import CodeBlock from '../../components/CodeBlock';

const ShoppingCart: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack layerStyle="section" spacing={8}>
        {/* Header */}
        <Box textAlign="center">
          <Heading size="xl" mb={4}>
            Shopping Cart Example
            <Badge ml={3} colorScheme="purple">
              Validation Focus
            </Badge>
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            A shopping cart application demonstrating Forestry 4's validation system, schema
            integration, and complex business logic handling.
          </Text>
        </Box>

        {/* Key Features */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Key Features Demonstrated
          </Heading>
          <List spacing={2}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Zod Schema Validation:</strong> Type-safe validation with detailed error
              messages
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Custom Test Functions:</strong> Business logic validation (inventory, pricing)
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Real-time Validation:</strong> Immediate feedback on user interactions
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Complex State Management:</strong> Cart items, totals, discounts, shipping
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Error Handling:</strong> Graceful handling of validation failures
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Transaction Safety:</strong> Atomic operations for cart modifications
            </ListItem>
          </List>
        </Box>

        {/* Live Demo */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Live Demo
          </Heading>
          <Text mb={4} color="gray.600">
            Try adding items to the cart, modifying quantities, and applying discounts. Notice how
            validation provides immediate feedback and prevents invalid states.
          </Text>
          <ShoppingCartDemo />
        </Box>

        {/* Validation Strategy */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Validation Strategy
          </Heading>

          <Alert status="info" mb={4}>
            <AlertIcon />
            This example demonstrates layered validation: schema validation for data types and
            custom tests for business rules.
          </Alert>

          <VStack spacing={4} align="stretch">
            <Box>
              <Heading size="sm" mb={2}>
                Schema Validation (Zod)
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Ensures data types, required fields, and basic constraints are met. Provides
                detailed error messages for each field.
              </Text>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>
                Business Logic Tests
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Custom validation functions that check inventory availability, pricing rules,
                discount eligibility, and shipping constraints.
              </Text>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>
                Real-time Feedback
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Validation runs on every state change, providing immediate feedback without waiting
                for form submission.
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* Schema Structure */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Schema & Validation
          </Heading>
          <CodeBlock language="typescript" title="Zod Schema Definition">
            {`import { z } from 'zod';

const CartItemSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  category: z.enum(['electronics', 'clothing', 'books', 'home']),
});

const ShoppingCartSchema = z.object({
  items: z.array(CartItemSchema),
  subtotal: z.number().nonnegative('Subtotal cannot be negative'),
  tax: z.number().nonnegative('Tax cannot be negative'),
  shipping: z.number().nonnegative('Shipping cannot be negative'),
  discount: z.number().nonnegative('Discount cannot be negative'),
  total: z.number().nonnegative('Total cannot be negative'),
  couponCode: z.string().optional(),
});

// Custom business logic tests
const cartTests = [
  (cart: CartState) => {
    // Check inventory availability
    const outOfStock = cart.items.find(item => 
      getInventory(item.id) < item.quantity
    );
    if (outOfStock) {
      return \`\${outOfStock.name} is out of stock\`;
    }
    return null;
  },
  
  (cart: CartState) => {
    // Validate discount eligibility
    if (cart.discount > 0 && cart.subtotal < 50) {
      return 'Minimum order of $50 required for discounts';
    }
    return null;
  },
  
  (cart: CartState) => {
    // Check maximum cart size
    if (cart.items.length > 20) {
      return 'Maximum 20 items allowed in cart';
    }
    return null;
  }
];`}
          </CodeBlock>
        </Box>

        {/* Store Actions */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Store Actions
          </Heading>
          <CodeBlock language="typescript" title="Cart Management Actions">
            {`const createShoppingCartStore = () => new Forest<CartState>({
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
            throw new Error(\`Checkout failed: \${validation.error}\`);
          }
          
          // Process payment, update inventory, etc.
          this.$.processPayment();
          this.$.updateInventory();
          this.$.clearCart();
        }
      });
    }
  }
});`}
          </CodeBlock>
        </Box>

        {/* Best Practices */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Validation Best Practices
          </Heading>
          <List spacing={3}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Layered Validation:</strong> Use schema for data types, tests for business
              logic
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Immediate Feedback:</strong> Validate on every state change for better UX
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Detailed Error Messages:</strong> Provide specific, actionable error
              information
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Transaction Safety:</strong> Use transactions for multi-step operations
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Graceful Degradation:</strong> Handle validation failures without breaking the
              UI
            </ListItem>
          </List>
        </Box>
      </VStack>
    </Container>
  );
};

export default ShoppingCart;
