// Component with error handling - pass handleError to factory
import React from 'react';
import { Button } from '@chakra-ui/react';
import { useForestryLocal } from '../../hooks/useForestryLocal';
import useErrorHandler from '../../hooks/useErrorHandler';
import shoppingCartStoreFactory from '../../storeFactories/ValidationSystem/shoppingCartStore';

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
};

export default ShoppingCartDemo;
