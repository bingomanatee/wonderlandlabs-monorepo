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
  Divider,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { Store } from '@wonderlandlabs/forestry4'
import CodeTabs from '../components/CodeTabs'

const Home: React.FC = () => {
  const [count, setCount] = useState(0)
  const [store, setStore] = useState<Store<{ count: number }> | null>(null)

  useEffect(() => {
    // Create demo store
    const counterStore = new Store({
      name: 'demo-counter',
      value: { count: 0 },
      actions: {
        increment: function(this: Store<{ count: number }>, value: { count: number }) {
          this.next({ ...value, count: value.count + 1 });
        },
        decrement: function(this: Store<{ count: number }>, value: { count: number }) {
          this.next({ ...value, count: value.count - 1 });
        },
        reset: function(this: Store<{ count: number }>) {
          this.next({ count: 0 });
        },
      },
    })

    // Subscribe to changes
    const subscription = counterStore.subscribe((state) => {
      setCount(state.count)
    })

    setStore(counterStore)

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const quickStartTabs = [
    {
      label: 'Installation',
      language: 'bash',
      code: `npm install @wonderlandlabs/forestry4
# or
yarn add @wonderlandlabs/forestry4`,
    },
    {
      label: 'Basic Usage',
      language: 'typescript',
      code: `import { Store } from '@wonderlandlabs/forestry4';

const store = new Store({
  name: 'counter',
  value: { count: 0 },
  actions: {
    increment: function(value) {
      this.next({ ...value, count: value.count + 1 });
    },
    decrement: function(value) {
      this.next({ ...value, count: value.count - 1 });
    },
    reset: function() {
      this.next({ count: 0 });
    }
  }
});

// Subscribe to changes
store.subscribe(state => {
  console.log('Count:', state.count);
});

// Use actions
store.$.increment();
store.$.decrement();
store.$.reset();`,
    },
    {
      label: 'React Integration',
      language: 'tsx',
      code: `import React, { useState, useEffect } from 'react';
import { Store } from '@wonderlandlabs/forestry4';

const Counter: React.FC = () => {
  const [count, setCount] = useState(0);
  const [store] = useState(() => new Store({
    name: 'counter',
    value: { count: 0 },
    actions: {
      increment: (state) => ({ ...state, count: state.count + 1 }),
      decrement: (state) => ({ ...state, count: state.count - 1 }),
    }
  }));

  useEffect(() => {
    const subscription = store.subscribe(state => {
      setCount(state.count);
    });
    return () => subscription.unsubscribe();
  }, [store]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => store.$.increment()}>+</button>
      <button onClick={() => store.$.decrement()}>-</button>
    </div>
  );
};`,
    },
  ]

  return (
    <Container maxW="container.xl" py={8}>
      {/* Hero Section */}
      <VStack spacing={6} textAlign="center" mb={12}>
        <Heading size="2xl" color="gray.800">
          🌲 Forestry 4
        </Heading>
        <Text fontSize="xl" color="gray.600" maxW="2xl">
          A simple, powerful state management library for React. Start with the essentials,
          then unlock advanced features when you need them.
        </Text>
        <HStack spacing={4}>
          <Button as={RouterLink} to="/why" colorScheme="forest" size="lg">
            Why Forestry?
          </Button>
          <Button as={RouterLink} to="/store" variant="outline" size="lg">
            Get Started
          </Button>
        </HStack>
      </VStack>

      {/* Essential vs Power Tools */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={12}>
        <Card borderWidth="2px" borderColor="forest.200">
          <CardBody>
            <VStack align="start" spacing={4}>
              <HStack>
                <Badge colorScheme="forest" fontSize="md" px={3} py={1}>
                  Essential Features
                </Badge>
                <Text fontSize="sm" color="gray.500">Start here</Text>
              </HStack>
              <Heading size="lg" color="forest.700">Get productive in 5 minutes</Heading>
              <Text color="gray.600">
                Everything you need to manage state in React applications. Simple, predictable, and powerful.
              </Text>
              <VStack align="start" spacing={2} fontSize="sm">
                <HStack>
                  <Text>✅</Text>
                  <Text>Create stores with initial state</Text>
                </HStack>
                <HStack>
                  <Text>✅</Text>
                  <Text>Define actions for state updates</Text>
                </HStack>
                <HStack>
                  <Text>✅</Text>
                  <Text>React hooks integration</Text>
                </HStack>
                <HStack>
                  <Text>✅</Text>
                  <Text>TypeScript support</Text>
                </HStack>
              </VStack>
              <Button as={RouterLink} to="/store" colorScheme="forest" size="lg" w="full">
                Start with Essentials
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card borderWidth="2px" borderColor="purple.200">
          <CardBody>
            <VStack align="start" spacing={4}>
              <HStack>
                <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                  Power Tools
                </Badge>
                <Text fontSize="sm" color="gray.500">When you need more</Text>
              </HStack>
              <Heading size="lg" color="purple.700">Advanced capabilities</Heading>
              <Text color="gray.600">
                Unlock advanced features for complex applications: validation, transactions, and reactive patterns.
              </Text>
              <VStack align="start" spacing={2} fontSize="sm">
                <HStack>
                  <Text>🔧</Text>
                  <Text>Built-in validation system</Text>
                </HStack>
                <HStack>
                  <Text>🔧</Text>
                  <Text>Atomic transactions with rollback</Text>
                </HStack>
                <HStack>
                  <Text>🔧</Text>
                  <Text>RxJS reactive programming</Text>
                </HStack>
                <HStack>
                  <Text>🔧</Text>
                  <Text>Advanced patterns & debugging</Text>
                </HStack>
              </VStack>
              <Button as={RouterLink} to="/validation" colorScheme="purple" variant="outline" size="lg" w="full">
                Explore Power Tools
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Quick Start */}
      <Box mb={12}>
        <Heading size="lg" mb={6}>
          Quick Start
        </Heading>
        <CodeTabs tabs={quickStartTabs} />
      </Box>

      {/* Live Demo */}
      <Card>
        <CardBody>
          <VStack spacing={6}>
            <Heading size="lg">Live Demo</Heading>
            <Text color="gray.600">
              Try out Forestry 4 with this interactive counter example:
            </Text>
            
            <Box
              p={6}
              bg="gray.100"
              borderRadius="md"
              textAlign="center"
              minW="300px"
            >
              <Text fontSize="3xl" fontWeight="bold" color="forest.600" mb={4}>
                {count}
              </Text>
              <HStack spacing={4} justify="center">
                <Button
                  colorScheme="forest"
                  onClick={() => store?.$.increment()}
                  disabled={!store}
                >
                  +1
                </Button>
                <Button
                  variant="outline"
                  onClick={() => store?.$.decrement()}
                  disabled={!store}
                >
                  -1
                </Button>
                <Button
                  colorScheme="red"
                  variant="outline"
                  onClick={() => store?.$.reset()}
                  disabled={!store}
                >
                  Reset
                </Button>
              </HStack>
            </Box>

            <Divider />

            <VStack spacing={4} align="start" w="full">
              <Heading size="md">Source Code</Heading>
              <Text color="gray.600" fontSize="sm">
                Here's the exact code powering this demo:
              </Text>

              <CodeTabs
                tabs={[
          {
            label: 'Store Definition',
            language: 'typescript',
            code: `// Create the counter store
const counterStore = new Store({
  name: 'demo-counter',
  value: { count: 0 },
  actions: {
    increment: function(value: { count: number }) {
      this.next({ ...value, count: value.count + 1 });
    },
    decrement: function(value: { count: number }) {
      this.next({ ...value, count: value.count - 1 });
    },
    reset: function() {
      this.next({ count: 0 });
    },
  },
})`,
          },
          {
            label: 'React Integration',
            language: 'tsx',
            code: `// React component using the store
const [count, setCount] = useState(0)
const [store, setStore] = useState<Store<{ count: number }> | null>(null)

useEffect(() => {
  // Subscribe to store changes
  const subscription = counterStore.subscribe((value) => {
    setCount(value.count)
  })

  setStore(counterStore)

  return () => {
    subscription.unsubscribe()
  }
}, [])

// Button handlers
const handleIncrement = () => store?.$.increment()
const handleDecrement = () => store?.$.decrement()
const handleReset = () => store?.$.reset()`,
          },
          {
            label: 'JSX Template',
            language: 'tsx',
            code: `<Box p={6} bg="gray.100" borderRadius="md" textAlign="center">
  <Text fontSize="3xl" fontWeight="bold" color="forest.600" mb={4}>
    {count}
  </Text>
  <HStack spacing={4} justify="center">
    <Button colorScheme="forest" onClick={handleIncrement}>
      +1
    </Button>
    <Button variant="outline" onClick={handleDecrement}>
      -1
    </Button>
    <Button colorScheme="red" variant="outline" onClick={handleReset}>
      Reset
    </Button>
  </HStack>
</Box>`,
          },
        ]}
              />
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  )
}

export default Home
