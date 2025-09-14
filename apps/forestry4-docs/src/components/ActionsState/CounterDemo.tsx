import React from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  SimpleGrid,
  Badge,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import useForestryLocal from '@/hooks/useForestryLocal.ts';
import counterForestFactory, { type CounterState } from '@/storeFactories/counterStoreFactory.ts';

const CounterDemo: React.FC = () => {
  // Use Forestry hook instead of manual state management
  const [counterState, counterForest] = useForestryLocal(counterForestFactory);



  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
      <VStack spacing={4} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>Counter Controls</Text>
          
          <VStack spacing={3} align="stretch">
            <HStack>
              <Button
                colorScheme="forest"
                onClick={() => counterForest.$.increment()}
              >
                +{counterState.multiplier}
              </Button>
              <Button
                colorScheme="forest"
                variant="outline"
                onClick={() => counterForest.$.decrement()}
              >
                -{counterState.multiplier}
              </Button>
              <Button
                colorScheme="blue"
                onClick={() => counterForest.$.doubleAndLog()}
              >
                Double
              </Button>
            </HStack>

            <HStack>
              <Button
                colorScheme="purple"
                onClick={() => counterForest.$.incrementTwice()}
              >
                +{counterState.multiplier * 2} (Twice)
              </Button>
              <Button
                variant="outline"
                onClick={() => counterForest.$.reset()}
              >
                Reset
              </Button>
            </HStack>
          </VStack>
        </Box>

        <Box>
          <FormControl>
            <FormLabel>Multiplier</FormLabel>
            <Input
              type="number"
              value={counterState.multiplier}
              onChange={(e) =>
                counterForest.$.setMultiplier(parseInt(e.target.value) || 1)
              }
            />
          </FormControl>
        </Box>

        {counterState.qualityMessage && (
          <Alert status="info">
            <AlertIcon />
            {counterState.qualityMessage}
          </Alert>
        )}
      </VStack>

      <VStack spacing={4} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>Current State</Text>
          <Box p={4} bg="gray.50" borderRadius="md">
            <HStack mb={2}>
              <Text fontWeight="semibold">Count:</Text>
              <Badge 
                colorScheme={counterState.count === 0 ? 'gray' : counterState.count > 0 ? 'green' : 'red'}
                fontSize="lg"
              >
                {counterState.count}
              </Badge>
            </HStack>
            <HStack>
              <Text fontWeight="semibold">Multiplier:</Text>
              <Badge colorScheme="blue">{counterState.multiplier}</Badge>
            </HStack>
          </Box>
        </Box>

        <Box>
          <HStack justify="space-between" align="center" mb={3}>
            <Text fontSize="lg" fontWeight="semibold">Action History</Text>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => counterForest.$.clearHistory()}
              isDisabled={counterState.history.length === 0}
            >
              Clear
            </Button>
          </HStack>
          <Box
            maxH="200px"
            overflowY="auto"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={3}
          >
            {counterState.history.length === 0 ? (
              <Text color="gray.500" fontStyle="italic" textAlign="center">
                No actions yet
              </Text>
            ) : (
              <VStack spacing={1} align="stretch">
                {counterState.history.map((entry, index) => (
                  <Text key={index} fontSize="sm" fontFamily="mono">
                    {index + 1}. {entry}
                  </Text>
                ))}
              </VStack>
            )}
          </Box>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.600">
            <strong>Try:</strong> Use different multipliers, try to exceed limits (-100 to +100), 
            or set multiplier below 1 to see validation in action.
          </Text>
        </Box>
      </VStack>
    </SimpleGrid>
  );
};

export default CounterDemo;
