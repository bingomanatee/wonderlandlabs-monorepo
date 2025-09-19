import React from 'react';
import { Box, Button, Text, HStack } from '@chakra-ui/react';
import useForestryLocal from '../../hooks/useForestryLocal';
import { homeDemoStoreFactory } from '../../storeFactories/homeDemoStoreFactory';

const LiveCounterDemo: React.FC = () => {
  return ''; // TEMPORARILY DISABLED FOR 4.1.3 MIGRATION
  const [value, store] = useForestryLocal(homeDemoStoreFactory);
  const { count } = value;

  return (
    <Box p={6} bg="gray.100" borderRadius="md" textAlign="center" minW="300px">
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

export default LiveCounterDemo;
