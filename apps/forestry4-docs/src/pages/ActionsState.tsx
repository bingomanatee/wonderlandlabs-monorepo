import React, { useState, useEffect } from 'react'
import {
  Container,
  Heading,
  Text,
  Box,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Divider,
} from '@chakra-ui/react'
import { Store } from '@wonderlandlabs/forestry4'
import CodeTabs from '../components/CodeTabs'

interface CounterState {
  count: number
  history: string[]
  multiplier: number
}

const ActionsState: React.FC = () => {
  const [counterState, setCounterState] = useState<CounterState>({ count: 0, history: [], multiplier: 1 })
  const [store, setStore] = useState<Store<CounterState> | null>(null)

  useEffect(() => {
    const counterStore = new Store<CounterState>({
      name: 'actions-demo',
      value: { count: 0, history: [], multiplier: 1 },
      actions: {
        // Basic state updates
        increment: function(value: CounterState) {
          const newCount = value.count + value.multiplier;
          this.next({
            ...value,
            count: newCount,
            history: [...value.history, `Incremented to ${newCount}`]
          });
        },
        decrement: function(value: CounterState) {
          const newCount = value.count - value.multiplier;
          this.next({
            ...value,
            count: newCount,
            history: [...value.history, `Decremented to ${newCount}`]
          });
        },
        // Single field updates
        setMultiplier: function(value: CounterState, multiplier: number) {
          this.set('multiplier', multiplier);
        },
        // Complex state transformations
        doubleAndLog: function(value: CounterState) {
          const doubled = value.count * 2;
          this.next({
            ...value,
            count: doubled,
            history: [...value.history, `Doubled from ${value.count} to ${doubled}`]
          });
        },
        // Nested actions calling other actions
        incrementTwice: function(value: CounterState) {
          this.$.increment();
          this.$.increment();
        },
        reset: function() {
          this.next({ count: 0, history: ['Reset to 0'], multiplier: 1 });
        },
        clearHistory: function(value: CounterState) {
          this.set('history', []);
        },
      },
      tests: [
        (value: CounterState) => value.count < -100 ? 'Count too low' : null,
        (value: CounterState) => value.count > 100 ? 'Count too high' : null,
        (value: CounterState) => value.multiplier < 1 ? 'Multiplier must be at least 1' : null,
      ]
    })

    const subscription = counterStore.subscribe((state) => {
      setCounterState(state)
    })

    setStore(counterStore)

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={4}>
            Actions & State Management
            <Badge ml={3} colorScheme="forest">Essential</Badge>
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Learn how to define actions and manage state updates in Forestry 4.
          </Text>
        </Box>

        {/* Core Concepts */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Action Patterns</Heading>
              <Text color="gray.600">
                Actions are functions that transform your store's state. They receive the current value
                as their first parameter and can use various methods to update the store.
              </Text>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Box>
                  <Heading size="md" mb={3}>Single Field Updates</Heading>
                  <Text color="gray.600" mb={4}>
                    Use <code>this.set()</code> for updating individual fields efficiently.
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md" fontFamily="mono" fontSize="sm">
                    <Text>setMultiplier: function(value, multiplier) {`{`}</Text>
                    <Text ml={4}>this.set('multiplier', multiplier);</Text>
                    <Text>{`}`}</Text>
                  </Box>
                </Box>

                <Box>
                  <Heading size="md" mb={3}>Multiple Field Updates</Heading>
                  <Text color="gray.600" mb={4}>
                    Use <code>this.next()</code> for updating multiple fields or complex transformations.
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md" fontFamily="mono" fontSize="sm">
                    <Text>increment: function(value) {`{`}</Text>
                    <Text ml={4}>this.next({`{`}</Text>
                    <Text ml={8}>...value,</Text>
                    <Text ml={8}>count: value.count + 1</Text>
                    <Text ml={4}>{`}`});</Text>
                    <Text>{`}`}</Text>
                  </Box>
                </Box>

                <Box>
                  <Heading size="md" mb={3}>Nested Actions</Heading>
                  <Text color="gray.600" mb={4}>
                    Actions can call other actions using <code>this.$</code> for composition.
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md" fontFamily="mono" fontSize="sm">
                    <Text>incrementTwice: function(value) {`{`}</Text>
                    <Text ml={4}>this.$.increment();</Text>
                    <Text ml={4}>this.$.increment();</Text>
                    <Text>{`}`}</Text>
                  </Box>
                </Box>

                <Box>
                  <Heading size="md" mb={3}>Complex Transformations</Heading>
                  <Text color="gray.600" mb={4}>
                    Combine multiple operations in a single action for atomic updates.
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md" fontFamily="mono" fontSize="sm">
                    <Text>doubleAndLog: function(value) {`{`}</Text>
                    <Text ml={4}>const doubled = value.count * 2;</Text>
                    <Text ml={4}>this.next({`{`}</Text>
                    <Text ml={8}>...value,</Text>
                    <Text ml={8}>count: doubled,</Text>
                    <Text ml={8}>history: [...value.history, `log`]</Text>
                    <Text ml={4}>{`}`});</Text>
                    <Text>{`}`}</Text>
                  </Box>
                </Box>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
        {/* Live Demo */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Interactive Actions Demo</Heading>
              <Text color="gray.600">
                Try different action patterns and see how they update the state:
              </Text>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <VStack spacing={4} align="stretch">
                  <Box p={6} bg="gray.50" borderRadius="lg">
                    <VStack spacing={4}>
                      <Heading size="md">Current State</Heading>
                      <Text fontSize="2xl" fontWeight="bold" color="forest.500">
                        Count: {counterState.count}
                      </Text>
                      <Text>Multiplier: {counterState.multiplier}</Text>
                      <Text fontSize="sm" color="gray.600">
                        History: {counterState.history.length} entries
                      </Text>
                    </VStack>
                  </Box>

                  <VStack spacing={3}>
                    <Heading size="sm">Basic Actions</Heading>
                    <HStack>
                      <Button colorScheme="forest" onClick={() => store?.$.increment()}>
                        +{counterState.multiplier}
                      </Button>
                      <Button colorScheme="red" onClick={() => store?.$.decrement()}>
                        -{counterState.multiplier}
                      </Button>
                    </HStack>

                    <Heading size="sm" mt={4}>Multiplier</Heading>
                    <HStack>
                      <Button size="sm" onClick={() => store?.$.setMultiplier(1)}>1x</Button>
                      <Button size="sm" onClick={() => store?.$.setMultiplier(2)}>2x</Button>
                      <Button size="sm" onClick={() => store?.$.setMultiplier(5)}>5x</Button>
                    </HStack>

                    <Heading size="sm" mt={4}>Complex Actions</Heading>
                    <HStack>
                      <Button colorScheme="purple" onClick={() => store?.$.doubleAndLog()}>
                        Double
                      </Button>
                      <Button colorScheme="blue" onClick={() => store?.$.incrementTwice()}>
                        +2 (Nested)
                      </Button>
                    </HStack>

                    <Heading size="sm" mt={4}>Reset</Heading>
                    <HStack>
                      <Button variant="outline" onClick={() => store?.$.reset()}>
                        Reset All
                      </Button>
                      <Button variant="outline" onClick={() => store?.$.clearHistory()}>
                        Clear History
                      </Button>
                    </HStack>
                  </VStack>
                </VStack>

                <VStack spacing={4} align="stretch">
                  <Box>
                    <Heading size="md" mb={3}>Action History</Heading>
                    <Box
                      maxH="300px"
                      overflowY="auto"
                      p={4}
                      bg="gray.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      {counterState.history.length === 0 ? (
                        <Text color="gray.500" fontStyle="italic">No actions yet...</Text>
                      ) : (
                        <VStack spacing={2} align="stretch">
                          {counterState.history.slice(-10).map((entry, index) => (
                            <Text key={index} fontSize="sm" fontFamily="mono">
                              {entry}
                            </Text>
                          ))}
                          {counterState.history.length > 10 && (
                            <Text fontSize="xs" color="gray.500">
                              ... and {counterState.history.length - 10} more
                            </Text>
                          )}
                        </VStack>
                      )}
                    </Box>
                  </Box>
                </VStack>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Source Code */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Complete Source Code</Heading>
              <Text color="gray.600">
                Here's the complete implementation of the actions demo above:
              </Text>

              <CodeTabs
                tabs={[
                  {
                    label: 'Store Definition',
                    language: 'typescript',
                    code: `const store = new Store<CounterState>({
  name: 'actions-demo',
  value: { count: 0, history: [], multiplier: 1 },
  actions: {
    // Basic state updates
    increment: function(value: CounterState) {
      const newCount = value.count + value.multiplier;
      this.next({
        ...value,
        count: newCount,
        history: [...value.history, \`Incremented to \${newCount}\`]
      });
    },
    decrement: function(value: CounterState) {
      const newCount = value.count - value.multiplier;
      this.next({
        ...value,
        count: newCount,
        history: [...value.history, \`Decremented to \${newCount}\`]
      });
    },
    // Single field updates
    setMultiplier: function(value: CounterState, multiplier: number) {
      this.set('multiplier', multiplier);
    },
    // Complex transformations
    doubleAndLog: function(value: CounterState) {
      const doubled = value.count * 2;
      this.next({
        ...value,
        count: doubled,
        history: [...value.history, \`Doubled from \${value.count} to \${doubled}\`]
      });
    },
    // Nested actions
    incrementTwice: function(value: CounterState) {
      this.$.increment();
      this.$.increment();
    },
    reset: function() {
      this.next({ count: 0, history: ['Reset to 0'], multiplier: 1 });
    },
    clearHistory: function(value: CounterState) {
      this.set('history', []);
    },
  },
  tests: [
    (value: CounterState) => value.count < -100 ? 'Count too low' : null,
    (value: CounterState) => value.count > 100 ? 'Count too high' : null,
    (value: CounterState) => value.multiplier < 1 ? 'Multiplier must be at least 1' : null,
  ]
});`,
                  },
                  {
                    label: 'React Integration',
                    language: 'tsx',
                    code: `const [counterState, setCounterState] = useState<CounterState>({
  count: 0, history: [], multiplier: 1
});

useEffect(() => {
  const subscription = store.subscribe((state) => {
    setCounterState(state);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

// Usage in JSX
<Button onClick={() => store.$.increment()}>
  +{counterState.multiplier}
</Button>
<Button onClick={() => store.$.doubleAndLog()}>
  Double
</Button>`,
                  },
                  {
                    label: 'Action Patterns',
                    language: 'typescript',
                    code: `// ✅ Single field update - most efficient
setMultiplier: function(value, multiplier: number) {
  this.set('multiplier', multiplier);
}

// ✅ Multiple field update - atomic operation
increment: function(value) {
  this.next({
    ...value,
    count: value.count + value.multiplier,
    history: [...value.history, 'Incremented']
  });
}

// ✅ Nested actions - composition
incrementTwice: function(value) {
  this.$.increment();  // Call other actions
  this.$.increment();
}

// ✅ Complex transformation - business logic
doubleAndLog: function(value) {
  const doubled = value.count * 2;
  this.next({
    ...value,
    count: doubled,
    history: [...value.history, \`Doubled to \${doubled}\`]
  });
}`,
                  },
                ]}
              />
            </VStack>
          </CardBody>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Action Best Practices</Heading>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Box>
                  <Heading size="md" mb={3} color="green.600">✅ Do</Heading>
                  <VStack spacing={3} align="stretch">
                    <Box p={3} bg="green.50" borderRadius="md">
                      <Text fontWeight="semibold">Use descriptive action names</Text>
                      <Text fontSize="sm" color="gray.600">
                        <code>incrementByMultiplier</code> vs <code>inc</code>
                      </Text>
                    </Box>
                    <Box p={3} bg="green.50" borderRadius="md">
                      <Text fontWeight="semibold">Keep actions focused</Text>
                      <Text fontSize="sm" color="gray.600">
                        One action should do one thing well
                      </Text>
                    </Box>
                    <Box p={3} bg="green.50" borderRadius="md">
                      <Text fontWeight="semibold">Use this.set() for single fields</Text>
                      <Text fontSize="sm" color="gray.600">
                        More efficient than reconstructing objects
                      </Text>
                    </Box>
                    <Box p={3} bg="green.50" borderRadius="md">
                      <Text fontWeight="semibold">Compose with nested actions</Text>
                      <Text fontSize="sm" color="gray.600">
                        <code>this.$.otherAction()</code> for reusability
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                <Box>
                  <Heading size="md" mb={3} color="red.600">❌ Don't</Heading>
                  <VStack spacing={3} align="stretch">
                    <Box p={3} bg="red.50" borderRadius="md">
                      <Text fontWeight="semibold">Return values from actions</Text>
                      <Text fontSize="sm" color="gray.600">
                        Use <code>this.next()</code> or <code>this.set()</code>
                      </Text>
                    </Box>
                    <Box p={3} bg="red.50" borderRadius="md">
                      <Text fontWeight="semibold">Mutate the value parameter</Text>
                      <Text fontSize="sm" color="gray.600">
                        Always create new objects/arrays
                      </Text>
                    </Box>
                    <Box p={3} bg="red.50" borderRadius="md">
                      <Text fontWeight="semibold">Use arrow functions</Text>
                      <Text fontSize="sm" color="gray.600">
                        Use <code>function</code> for proper <code>this</code> binding
                      </Text>
                    </Box>
                    <Box p={3} bg="red.50" borderRadius="md">
                      <Text fontWeight="semibold">Make actions too complex</Text>
                      <Text fontSize="sm" color="gray.600">
                        Break complex logic into smaller actions
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default ActionsState
