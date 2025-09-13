import React, { useState, useEffect } from 'react'
import {
  Container,
  Heading,
  Text,
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  VStack,
  HStack,
  Badge,
  Alert,
  AlertIcon,
  Divider,
} from '@chakra-ui/react'
import { Store } from '@wonderlandlabs/forestry4'
import CodeTabs from '../components/CodeTabs'

interface DemoState {
  count: number
  name: string
  items: string[]
}

const Properties: React.FC = () => {
  const [demoState, setDemoState] = useState<DemoState>({ count: 0, name: '', items: [] })
  const [validationSuspended, setValidationSuspended] = useState(false)
  const [transactionDepth, setTransactionDepth] = useState(0)
  const [store, setStore] = useState<Store<DemoState> | null>(null)

  useEffect(() => {
    const demoStore = new Store<DemoState>({
      name: 'properties-demo',
      value: { count: 0, name: 'Demo Store', items: [] },
      actions: {
        increment(state: DemoState) {
          return { ...state, count: state.count + 1 }
        },
        setName(state: DemoState, name: string) {
          return { ...state, name }
        },
        addItem(state: DemoState, item: string) {
          return { ...state, items: [...state.items, item] }
        },
        reset() {
          return { count: 0, name: 'Demo Store', items: [] }
        },
      },
      tests(state: DemoState) {
        if (state.count < 0) return 'Count cannot be negative'
        if (state.name.length === 0) return 'Name cannot be empty'
        return null
      },
    })

    const subscription = demoStore.subscribe((state) => {
      setDemoState(state)
    })

    const transactionSubscription = demoStore.observeTransStack().subscribe((stack) => {
      setTransactionDepth(stack.length)
      setValidationSuspended(demoStore.suspendValidation)
    })

    setStore(demoStore)

    return () => {
      subscription.unsubscribe()
      transactionSubscription.unsubscribe()
    }
  }, [])

  const propertyTabs = [
    {
      label: 'value Property',
      language: 'typescript',
      code: `// Get current state synchronously
const currentState = store.value;
console.log(currentState); // { count: 5, name: "Demo" }

// Always returns the current state immediately
// No async operations needed`,
    },
    {
      label: 'name Property',
      language: 'typescript',
      code: `// Get the store's unique identifier
const storeName = store.name;
console.log(storeName); // "my-store"

// Useful for debugging and logging
console.log(\`Store \${store.name} updated\`);`,
    },
    {
      label: '$ Actions Property',
      language: 'typescript',
      code: `// Access all methodized actions
store.$.increment();
store.$.setName('New Name');
store.$.addItem('New Item');

// Actions are automatically bound and validated
// All actions return void and update state internally`,
    },
  ]

  const observableTabs = [
    {
      label: 'Basic Subscription',
      language: 'typescript',
      code: `// Subscribe to all state changes
const subscription = store.subscribe(state => {
  console.log('State updated:', state);
});

// Don't forget to unsubscribe
subscription.unsubscribe();`,
    },
    {
      label: 'RxJS Integration',
      language: 'typescript',
      code: `import { map, filter, distinctUntilChanged } from 'rxjs/operators';

// Use RxJS operators
store.asObservable()
  .pipe(
    map(state => state.count),
    filter(count => count > 5),
    distinctUntilChanged()
  )
  .subscribe(count => {
    console.log('Count > 5:', count);
  });`,
    },
    {
      label: 'React Hook',
      language: 'tsx',
      code: `import { useState, useEffect } from 'react';

const useStore = <T>(store: Store<T>) => {
  const [state, setState] = useState(store.value);

  useEffect(() => {
    const subscription = store.subscribe(setState);
    return () => subscription.unsubscribe();
  }, [store]);

  return state;
};

// Usage
const MyComponent = () => {
  const state = useStore(myStore);
  return <div>Count: {state.count}</div>;
};`,
    },
  ]

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={4}>
            Store Properties
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Explore all the public properties available on Store instances with interactive examples.
          </Text>
        </Box>

        {/* Core Properties */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Core Properties</Heading>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {/* value Property */}
                <Box>
                  <HStack mb={3}>
                    <Heading size="md">value</Heading>
                    <Badge colorScheme="blue">T</Badge>
                  </HStack>
                  <Text color="gray.600" mb={4}>
                    Gets the current state value synchronously. Always returns the most up-to-date state.
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md" mb={4}>
                    <Text fontFamily="mono" fontSize="sm" mb={2}>
                      Current value:
                    </Text>
                    <pre>{JSON.stringify(demoState, null, 2)}</pre>
                  </Box>
                  <Button size="sm" onClick={() => store?.$.increment()}>
                    Update Value
                  </Button>
                </Box>

                {/* name Property */}
                <Box>
                  <HStack mb={3}>
                    <Heading size="md">name</Heading>
                    <Badge colorScheme="green">string</Badge>
                  </HStack>
                  <Text color="gray.600" mb={4}>
                    The unique identifier for this store instance. Useful for debugging and logging.
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md" mb={4}>
                    <Text fontFamily="mono" fontSize="sm">
                      Store name: "{store?.name}"
                    </Text>
                  </Box>
                </Box>

                {/* $ Property */}
                <Box>
                  <HStack mb={3}>
                    <Heading size="md">$</Heading>
                    <Badge colorScheme="purple">Actions</Badge>
                  </HStack>
                  <Text color="gray.600" mb={4}>
                    Access to all methodized actions for state updates. Actions are automatically bound and validated.
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md" mb={4}>
                    <Text fontFamily="mono" fontSize="sm" mb={2}>
                      Available actions:
                    </Text>
                    <Text fontFamily="mono" fontSize="sm">
                      {Object.keys(store?.$ || {}).join(', ')}
                    </Text>
                  </Box>
                  <HStack>
                    <Button size="sm" onClick={() => store?.$.increment()}>
                      Increment
                    </Button>
                    <Button size="sm" onClick={() => store?.$.addItem(`Item ${Date.now()}`)}>
                      Add Item
                    </Button>
                  </HStack>
                </Box>

                {/* suspendValidation Property */}
                <Box>
                  <HStack mb={3}>
                    <Heading size="md">suspendValidation</Heading>
                    <Badge colorScheme="orange">boolean</Badge>
                  </HStack>
                  <Text color="gray.600" mb={4}>
                    Indicates if validation is currently suspended (during transactions).
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md" mb={4}>
                    <HStack>
                      <Text fontFamily="mono" fontSize="sm">
                        Validation suspended:
                      </Text>
                      <Badge colorScheme={validationSuspended ? 'red' : 'green'}>
                        {validationSuspended ? 'Yes' : 'No'}
                      </Badge>
                    </HStack>
                  </Box>
                  <Button
                    size="sm"
                    onClick={() => {
                      store?.transact({
                        suspendValidation: true,
                        action() {
                          setTimeout(() => {
                            this.$.increment()
                          }, 1000)
                        },
                      })
                    }}
                  >
                    Start Transaction
                  </Button>
                </Box>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Property Usage Examples</Heading>
              <CodeTabs tabs={propertyTabs} />
            </VStack>
          </CardBody>
        </Card>

        {/* Observable Properties */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Observable Properties</Heading>
              <Text color="gray.600">
                Properties that return RxJS observables for reactive programming patterns.
              </Text>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Box>
                  <HStack mb={3}>
                    <Heading size="md">asObservable()</Heading>
                    <Badge colorScheme="teal">Observable&lt;T&gt;</Badge>
                  </HStack>
                  <Text color="gray.600" mb={4}>
                    Returns the store as an RxJS Observable for reactive subscriptions and operator chaining.
                  </Text>
                </Box>

                <Box>
                  <HStack mb={3}>
                    <Heading size="md">observeTransStack()</Heading>
                    <Badge colorScheme="cyan">Observable&lt;PendingValue[]&gt;</Badge>
                  </HStack>
                  <Text color="gray.600" mb={4}>
                    Observe the transaction stack for debugging and monitoring transaction state changes.
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md">
                    <Text fontFamily="mono" fontSize="sm">
                      Transaction stack depth: <Badge>{transactionDepth}</Badge>
                    </Text>
                  </Box>
                </Box>
              </SimpleGrid>

              <Divider />

              <CodeTabs tabs={observableTabs} />
            </VStack>
          </CardBody>
        </Card>

        {/* Live Demo */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Interactive Property Demo</Heading>

              <Alert status="info">
                <AlertIcon />
                Try the buttons below to see how different properties change in real-time.
              </Alert>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Actions</Heading>
                  <HStack wrap="wrap">
                    <Button onClick={() => store?.$.increment()}>
                      Increment Count
                    </Button>
                    <Button onClick={() => store?.$.setName(`Updated ${Date.now()}`)}>
                      Update Name
                    </Button>
                    <Button onClick={() => store?.$.addItem(`Item ${demoState.items.length + 1}`)}>
                      Add Item
                    </Button>
                    <Button colorScheme="red" variant="outline" onClick={() => store?.$.reset()}>
                      Reset All
                    </Button>
                  </HStack>
                </VStack>

                <VStack spacing={4} align="stretch">
                  <Heading size="md">Current Properties</Heading>
                  <VStack align="start" spacing={2} fontSize="sm">
                    <HStack>
                      <Text fontWeight="semibold">store.name:</Text>
                      <Badge>{store?.name}</Badge>
                    </HStack>
                    <HStack>
                      <Text fontWeight="semibold">store.value.count:</Text>
                      <Badge colorScheme="blue">{demoState.count}</Badge>
                    </HStack>
                    <HStack>
                      <Text fontWeight="semibold">store.value.items.length:</Text>
                      <Badge colorScheme="green">{demoState.items.length}</Badge>
                    </HStack>
                    <HStack>
                      <Text fontWeight="semibold">store.suspendValidation:</Text>
                      <Badge colorScheme={validationSuspended ? 'red' : 'green'}>
                        {validationSuspended.toString()}
                      </Badge>
                    </HStack>
                  </VStack>
                </VStack>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default Properties
