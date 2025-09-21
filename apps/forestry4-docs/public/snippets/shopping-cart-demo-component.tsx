// Auto-generated snippet from: apps/forestry4-docs/src/examples/shopping-cart/ShoppingCartDemoComponent.tsx
// Description: Complete shopping cart demo component with validation and error handling
// Last synced: Sat Sep 20 21:09:31 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import {
  Box,
  Button,
  CloseButton,
  Heading,
  HStack,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import useForestryLocal from '../../hooks/useForestryLocal';
import useErrorHandler from '../../hooks/useErrorHandler';
import shoppingCartStoreFactory, {
  CartItem,
  ShoppingCart,
} from '../../storeFactories/ValidationSystem/shoppingCartStore';
import { PRODUCTS } from '@/constants.ts';

const dollar = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const ShoppingCartDemoComponent: React.FC = () => {
  const { handleError } = useErrorHandler();
  const [cartState, cartStore] = useForestryLocal<ShoppingCart>(
    shoppingCartStoreFactory,
    handleError
  );

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
      <VStack spacing={4} align="stretch">
        <Heading size="md">Available Products</Heading>
        {PRODUCTS.map((product) => (
          <Box key={product.id} p={3} border="1px" borderColor="gray.200" borderRadius="md">
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">{product.name}</Text>
                <Text fontSize="sm" color="gray.600">
                  ${product.price}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Stock: {product.inStock}
                </Text>
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
          <Button colorScheme="red" variant="outline" onClick={cartStore.$.clearCart}>
            Clear Cart
          </Button>
        </HStack>

        {cartState.items.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={4}>
            Cart is empty
          </Text>
        ) : (
          <VStack spacing={3} align="stretch">
            {cartState.items.map((item: CartItem) => {
              const product = PRODUCTS.find((p) => p.id === item.productId);
              const productPrice = product ? product.price : 0;
              const totalPrice = item.quantity * productPrice;
              return (
                <Box key={item.productId} p={3}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <CloseButton
                          colorScheme="red"
                          onClick={() => cartStore.$.removeItem(item.productId)}
                        />
                        <Text fontWeight="semibold">
                          {product ? product.name : `Unknown (${item.productId})`}
                        </Text>
                      </HStack>
                    </VStack>
                    <HStack spacing={2}>
                      <NumberInput
                        size="sm"
                        value={item.quantity}
                        min={0}
                        width="100px"
                        style={{ textAlign: 'right' }}
                        onChange={(valueString) => {
                          const quantity = parseInt(valueString) || 0;
                          cartStore.$.safeUpdateProduct(item.productId, quantity);
                        }}
                      >
                        <NumberInputField textAlign="right" />
                      </NumberInput>
                    </HStack>
                  </HStack>
                  <HStack width="full" justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      {dollar.format(productPrice)} each
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {dollar.format(totalPrice)}
                    </Text>
                  </HStack>
                </Box>
              );
            })}
            <HStack width="full" justify="space-between" px={4}>
              <Text>Total:</Text>
              <Text fontWeight={800}> ${dollar.format(cartState.totalCost)}</Text>
            </HStack>
          </VStack>
        )}
      </VStack>
    </SimpleGrid>
  );
};

export default ShoppingCartDemoComponent;
