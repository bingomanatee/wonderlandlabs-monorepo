import React from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
} from '@chakra-ui/react';
import CodeBlock from '@/components/CodeBlock';

const ValidationGuide: React.FC = () => {
  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Deeper Thoughts - Validation Troubleshooting Guide</Heading>
          <Text color="gray.600">
            A comprehensive guide to choosing the right validation approach for different scenarios.
            Understanding when to use schema validation, business logic tests, or UI state
            management.
          </Text>

          <Alert status="info">
            <AlertIcon />
            <Text fontSize="sm">
              <strong>Three-Layer Approach:</strong> Use Zod for type safety, test functions for
              critical business rules, and prep functions for transient UI state. Each layer serves
              a different purpose and validation concern.
            </Text>
          </Alert>

          <Box p={4} bg="blue.50" borderRadius="md">
            <Text fontWeight="semibold" mb={3}>
              🤔 Decision Tree - Which Validation to Use?
            </Text>
            <VStack spacing={2} align="start" fontSize="sm">
              <Text>
                <strong>1. Type Safety & Structure?</strong> → Use <Code>Zod</Code> schema
                validation
              </Text>
              <Text>
                <strong>2. Critical Business Rules?</strong> → Use <Code>tests</Code> functions
              </Text>
              <Text>
                <strong>3. Transient UI Feedback?</strong> → Use <Code>prep</Code> functions
              </Text>
            </VStack>
          </Box>

          <Tabs variant="enclosed">
            <TabList>
              <Tab>1. Schema Validation (Zod)</Tab>
              <Tab>2. Business Rules (Tests)</Tab>
              <Tab>3. UI State (Prep)</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Box p={4} bg="green.50" borderRadius="md">
                    <Text fontWeight="semibold" mb={2}>
                      ✅ When to Use Zod:
                    </Text>
                    <VStack spacing={1} align="start" fontSize="sm">
                      <Text>• Data from uncontrolled sources (APIs, localStorage, user input)</Text>
                      <Text>• TypeScript only works at build time, not runtime</Text>
                      <Text>• Need structural validation (object shape, array types)</Text>
                      <Text>• Want automatic type inference and safety</Text>
                    </VStack>
                  </Box>

                  <CodeBlock
                    title="Zod Schema Example"
                    language="typescript"
                    code={`import { z } from 'zod'

const CartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive()
})

const ShoppingCartSchema = z.object({
  items: z.array(CartItemSchema),
  totalCost: z.number().nonnegative()
})

// Use in prep function for runtime validation
prep: function(input, current) {
  const parsed = ShoppingCartSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error('Invalid cart structure: ' + parsed.error.message)
  }
  return parsed.data
}`}
                  />
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Box p={4} bg="orange.50" borderRadius="md">
                    <Text fontWeight="semibold" mb={2}>
                      🔒 When to Use Test Functions:
                    </Text>
                    <VStack spacing={1} align="start" fontSize="sm">
                      <Text>• Complex business rules that can't be encoded in schemas</Text>
                      <Text>• "Quantum constraints" (no duplicates, referential integrity)</Text>
                      <Text>• Critical rules that should NEVER be saved to state</Text>
                      <Text>• Domain-specific validation (inventory, permissions, etc.)</Text>
                    </VStack>
                  </Box>

                  <CodeBlock
                    title="Business Rule Tests"
                    language="typescript"
                    code={`tests: [
  // Quantum constraint - no duplicates
  (cart) => {
    const productIds = cart.items.map(item => item.productId)
    const uniqueIds = new Set(productIds)
    return productIds.length !== uniqueIds.size 
      ? 'Cannot have same product twice - use quantity instead' 
      : null
  },

  // Business rule - inventory limits
  (cart) => {
    const outOfStock = cart.items.filter(item => {
      const product = PRODUCTS.find(p => p.id === item.productId)
      return product && item.quantity > product.inStock
    })
    return outOfStock.length > 0 
      ? 'Cannot exceed available stock' 
      : null
  },

  // System constraint - prevent negative quantities
  (cart) => {
    const invalid = cart.items.filter(item => item.quantity <= 0)
    return invalid.length > 0 
      ? 'Quantities must be positive' 
      : null
  }
]`}
                  />
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Box p={4} bg="purple.50" borderRadius="md">
                    <Text fontWeight="semibold" mb={2}>
                      💡 When to Use Prep Functions:
                    </Text>
                    <VStack spacing={1} align="start" fontSize="sm">
                      <Text>• Transient validation that's acceptable to save</Text>
                      <Text>• UI state calculation (canSubmit, error messages)</Text>
                      <Text>• Form field validation feedback</Text>
                      <Text>• Loading states, temporary conditions</Text>
                    </VStack>
                  </Box>

                  <CodeBlock
                    title="UI State in Prep Functions"
                    language="typescript"
                    code={`prep: function(input, current) {
  const result = { ...current, ...input }
  
  // Calculate UI validation state (non-blocking)
  const isValid = result.value.length >= 3 && 
                  result.value.length <= 20 && 
                  !result.value.includes(' ')
  
  const errorString = result.value.length < 3 
    ? 'Username too short (min 3 characters)'
    : result.value.length > 20 
    ? 'Username too long (max 20 characters)'
    : result.value.includes(' ')
    ? 'Username cannot contain spaces'
    : ''
  
  // Calculate form submission state
  const canSubmit = allFieldsValid && allFieldsFilled
  const submitError = !canSubmit 
    ? 'Please complete all required fields'
    : ''
  
  return {
    ...result,
    isValid,
    errorString,
    canSubmit,
    submitError
  }
}`}
                  />
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <Box p={4} bg="gray.50" borderRadius="md">
            <Text fontWeight="semibold" mb={2}>
              📚 Complete Example - All Three Layers:
            </Text>
            <Text fontSize="sm" mb={3}>
              A shopping cart that uses Zod for structure, tests for business rules, and prep for UI
              state:
            </Text>
            <CodeBlock
              language="typescript"
              code={`const cartStore = new Store({
  value: initialCart,
  
  // Layer 1: Structural validation (Zod)
  prep: (input) => {
    const parsed = CartSchema.safeParse(input)
    if (!parsed.success) throw new Error('Invalid structure')
    
    // Layer 3: UI state calculation
    const canCheckout = parsed.data.items.length > 0
    const checkoutError = !canCheckout ? 'Cart is empty' : ''
    
    return { ...parsed.data, canCheckout, checkoutError }
  },
  
  // Layer 2: Critical business rules
  tests: [
    (cart) => cart.items.some(item => item.quantity <= 0) 
      ? 'Invalid quantities detected' : null,
    (cart) => cart.items.length > 100 
      ? 'Cart too large' : null
  ]
})`}
            />
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ValidationGuide;
