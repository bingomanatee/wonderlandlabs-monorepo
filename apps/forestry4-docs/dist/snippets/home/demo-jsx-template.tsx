// Auto-generated snippet from: apps/forestry4-docs/src/components/examples/CompleteCounterDemo.tsx
// Description: Complete React component demo for home page
// Last synced: Mon Sep 15 14:19:17 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import { Box, Button, Text, HStack } from '@chakra-ui/react';
import useForestryLocal from '../../hooks/useForestryLocal';
import { homeDemoStoreFactory } from '../../storeFactories/homeDemoStoreFactory';

const CompleteCounterDemo: React.FC = () => {
  // Hook usage - connects store to React component
  const [value, store] = useForestryLocal(homeDemoStoreFactory);
  const { count } = value;

  return (
    <Box p={6} bg="gray.100" borderRadius="md" textAlign="center">
      <Text fontSize="3xl" fontWeight="bold" color="forest.600" mb={4}>
        {count}
      </Text>
      <HStack spacing={4} justify="center">
        <Button colorScheme="forest" onClick={store.$.increment}>
          +1
        </Button>
        <Button variant="outline" onClick={store.$.decrement}>
          -1
        </Button>
        <Button colorScheme="red" variant="outline" onClick={store.$.reset}>
          Reset
        </Button>
      </HStack>
    </Box>
  );
};

export default CompleteCounterDemo;
