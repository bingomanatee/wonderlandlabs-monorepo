import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  NumberInput,
  NumberInputField,
  Alert,
  AlertIcon,
  Badge
} from '@chakra-ui/react';
import useForestryLocal from '@/hooks/useForestryLocal.ts';
import useErrorHandler from '@/hooks/useErrorHandler.ts';
import shoppingCartStoreFactory from '@/storeFactories/ValidationSystem/shoppingCartStore.ts';
import { PRODUCTS } from '@/constants.ts';
import CodeTabs from '@/components/CodeTabs';
import Section from '../Section';

const ShoppingCartDemo: React.FC = () => {
  return ''; // TEMPORARILY DISABLED FOR 4.1.3 MIGRATION
  const { handleError } = useErrorHandler();
  const [cartState, cartStore] = useForestryLocal(() => shoppingCartStoreFactory(handleError));
  const [cartErrors, setCartErrors] = useState<string[]>([]);

  return (
    <Section>
      
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Shopping Cart - Critical Business Rules</Heading>
          <Text color="gray.600">
            This example demonstrates validation for critical business rules that should prevent invalid states from being saved.
            These are "quantum constraints" and system limits that protect data integrity.
          </Text>

          <Box p={4} bg="orange.50" borderRadius="md">
            <Text fontWeight="semibold" mb={2}>🔒 Critical Rules (Tests):</Text>
            <VStack spacing={1} align="start" fontSize="sm">
              <Text>• <strong>No duplicates</strong> - Same product can't appear twice (use quantity instead)</Text>
              <Text>• <strong>No negative quantities</strong> - Quantities must be positive integers</Text>
              <Text>• <strong>Stock limits</strong> - Cannot exceed available inventory</Text>
              <Text>• <strong>Valid products only</strong> - Products must exist in catalog</Text>
              <Text>• <strong>System limits</strong> - Maximum 100 total items per cart</Text>
            </VStack>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Available Products</Heading>
              {PRODUCTS.map(product => (
                <Box key={product.id} p={3} border="1px" borderColor="gray.200" borderRadius="md">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold">{product.name}</Text>
                      <Text fontSize="sm" color="gray.600">${product.price}</Text>
                      <Text fontSize="xs" color="gray.500">Stock: {product.inStock}</Text>
                    </VStack>
                    <Button
                      size="sm"
                      colorScheme="forest"
                      data-product-id={product.id}
                      data-quantity="1"
                      onClick={cartStore.$.safeAddItemFromEvent}
                    >
                      Add to Cart
                    </Button>
                  </HStack>
                </Box>
              ))}

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Button
                  colorScheme="red"
                  variant="outline"
                  size="sm"
                  data-product-id="invalid-product"
                  data-quantity="1"
                  onClick={cartStore.$.safeAddItemFromEvent}
                >
                  Add Invalid Product
                </Button>
                <Button
                  colorScheme="red"
                  variant="outline"
                  size="sm"
                  data-product-id="laptop"
                  data-quantity="10"
                  onClick={cartStore.$.safeAddItemFromEvent}
                >
                  Exceed Stock
                </Button>
              </SimpleGrid>
            </VStack>

            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="md">Shopping Cart</Heading>
                <Badge colorScheme="blue">
                  Total: ${cartState.totalCost.toFixed(2)}
                </Badge>
              </HStack>

              {cartErrors.length > 0 && (
                <Alert status="error">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    {cartErrors.map((error, index) => (
                      <Text key={index} fontSize="sm">{error}</Text>
                    ))}
                  </VStack>
                </Alert>
              )}

              {cartState.items.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={4}>
                  Cart is empty
                </Text>
              ) : (
                <VStack spacing={3} align="stretch">
                  {cartState.items.map(item => {
                    const product = PRODUCTS.find(p => p.id === item.productId);
                    return (
                      <Box key={item.productId} p={3} border="1px" borderColor="gray.200" borderRadius="md">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold">
                              {product ? product.name : `Unknown (${item.productId})`}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              ${product ? product.price : 0} each
                            </Text>
                          </VStack>
                          <HStack spacing={2}>
                            <NumberInput
                              size="sm"
                              value={item.quantity}
                              min={0}
                              onChange={(valueString) => {
                                cartStore.$.updateProduct(item.productId, parseInt(valueString) || 0)
                              }}
                            >
                              <NumberInputField />
                            </NumberInput>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => cartStore.$.removeItem(item.productId)}
                            >
                              Remove
                            </Button>
                          </HStack>
                        </HStack>
                      </Box>
                    );
                  })}
                </VStack>
              )}

              <Button
                colorScheme="red"
                variant="outline"
                onClick={() => cartStore.$.clearCart()}
              >
                Clear Cart
              </Button>
            </VStack>
          </SimpleGrid>

          {/* Source Code Section */}
          <Box>
            <Heading size="md" mb={4}>Source Code - Error Handling with Toasts</Heading>
            <Text color="gray.600" mb={4}>
              Here's how to implement global error handling with Chakra UI toasts for validation errors:
            </Text>

            <CodeTabs
              tabs={[
                {
                  label: 'Error Handler Hook',
                  language: 'typescript',
                  code: `// hooks/useErrorHandler.ts
import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

export function useErrorHandler() {
  const toast = useToast();

  const handleError = useCallback((error: Error | string, title?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;

    toast({
      title: title || 'Validation Error',
      description: errorMessage,
      status: 'error',
      duration: 4000,
      isClosable: true,
    });
  }, [toast]);

  const handleSuccess = useCallback((message: string, title?: string) => {
    toast({
      title: title || 'Success',
      description: message,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  return { handleError, handleSuccess };
}`
                },
                {
                  label: 'Component Usage',
                  language: 'tsx',
                  code: `// Component with error handling - pass handleError to factory
import useErrorHandler from '@/hooks/useErrorHandler';

const ShoppingCartDemo: React.FC = () => {
  const { handleError } = useErrorHandler();
  // Pass error handler to factory function
  const [cartState, cartStore] = useForestryLocal(() =>
    shoppingCartStoreFactory(handleError)
  );

  return (
    <Button
      data-product-id="invalid-product"
      data-quantity="1"
      onClick={cartStore.$.safeAddItemFromEvent}  // Use safe action directly
    >
      Add Invalid Product
    </Button>
  );
};`
                },
                {
                  label: 'Store Factory with Safe Actions',
                  language: 'typescript',
                  code: `// Store factory that accepts error handler and creates safe actions
type ErrorHandler = (error: Error | string, title?: string) => void;

export default function shoppingCartStoreFactory(handleError?: ErrorHandler) {
  return new Store({
    value: { items: [], totalCost: 0 },

    actions: {
      addItemFromEvent: function(value, event) {
        // Regular action that can throw validation errors
        const productId = event.currentTarget.dataset.productId;
        this.$.addItem(productId, 1);
      },

      // Safe actions that catch validation errors and show toasts
      ...(handleError ? {
        safeAddItemFromEvent: function(value, event) {
          try {
            this.$.addItemFromEvent(event);
          } catch (error) {
            handleError(error as Error, 'Cannot Add Item');
          }
        },

        safeUpdateQuantity: function(value, productId, quantity) {
          try {
            this.$.updateQuantity(productId, quantity);
          } catch (error) {
            handleError(error as Error, 'Cannot Update Quantity');
          }
        }
      } : {})
    },

    tests: [
      // Critical business rules that throw errors
      (value: ShoppingCart) => {
        const invalidItems = value.items.filter(item =>
          !PRODUCTS.find(p => p.id === item.productId)
        )
        return invalidItems.length > 0
          ? 'Cart contains products that no longer exist'
          : null
      }
    ]
  })
}`
                },
                {
                  label: 'Global Toast Setup',
                  language: 'tsx',
                  code: `// main.tsx - Global toast configuration
import { ChakraProvider } from '@chakra-ui/react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ChakraProvider
    theme={theme}
    toastOptions={{
      defaultOptions: {
        position: 'top-right',
        duration: 4000
      }
    }}
  >
    <App />
  </ChakraProvider>
)`
                }
              ]}
            />
          </Box>
        </VStack>
      
    </Section>
  );
};

export default ShoppingCartDemo;
