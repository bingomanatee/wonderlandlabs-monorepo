import React, { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Store } from '@wonderlandlabs/forestry4';
import CodeTabs from '../components/CodeTabs';
import Section from '../components/Section';
import SnippetBlock from '../components/SnippetBlock';

const Home: React.FC = () => {
  const [count, setCount] = useState(0);
  const [store, setStore] = useState<Store<{ count: number }> | null>(null);

  useEffect(() => {
    // Create demo store
    const counterStore = new Store({
      name: 'demo-counter',
      value: { count: 0 },
      actions: {
        increment: function (this: Store<{ count: number }>, value: { count: number }) {
          this.next({ ...value, count: value.count + 1 });
        },
        decrement: function (this: Store<{ count: number }>, value: { count: number }) {
          this.next({ ...value, count: value.count - 1 });
        },
        reset: function (this: Store<{ count: number }>) {
          this.next({ count: 0 });
        },
      },
    });

    // Subscribe to changes
    const subscription = counterStore.subscribe((state) => {
      setCount(state.count);
    });

    setStore(counterStore);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const quickStartTabs = [
    {
      label: 'Installation',
      language: 'bash',
      snippet: 'installation',
      folder: 'home',
    },
    {
      label: 'Basic Usage',
      language: 'typescript',
      snippet: 'basic-usage',
      folder: 'home',
      ts: true,
    },
    {
      label: 'React Integration',
      language: 'tsx',
      snippet: 'react-integration',
      folder: 'home',
    },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      {/* Hero Section */}
      <VStack spacing={6} textAlign="center" mb={12}>
        <Heading size="2xl" color="gray.800">
          🌲 Forestry 4
        </Heading>
        <Text fontSize="xl" color="gray.600" maxW="2xl">
          A simple, powerful state management library for React. Start with the essentials, then
          unlock advanced features when you need them.
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
        <Section>
          <HStack>
            <Badge colorScheme="forest" fontSize="md" px={3} py={1}>
              Essential Features
            </Badge>
            <Text fontSize="sm" color="gray.500">
              Start here
            </Text>
          </HStack>
          <Heading size="lg" color="forest.700">
            Get productive in 5 minutes
          </Heading>
          <Text color="gray.600">
            Everything you need to manage state in React applications. Simple, predictable, and
            powerful.
          </Text>
          <VStack align="start" spacing={2} fontSize="sm">
            <HStack>
              <Text>✅</Text>
              <Text as={RouterLink} to="/store" color="forest.600" _hover={{ textDecoration: 'underline' }}>
                Create stores with initial state
              </Text>
            </HStack>
            <HStack>
              <Text>✅</Text>
              <Text as={RouterLink} to="/actions" color="forest.600" _hover={{ textDecoration: 'underline' }}>
                Define actions for state updates
              </Text>
            </HStack>
            <HStack>
              <Text>✅</Text>
              <Text as={RouterLink} to="/react" color="forest.600" _hover={{ textDecoration: 'underline' }}>
                React hooks integration
              </Text>
            </HStack>
            <HStack>
              <Text>✅</Text>
              <Text as={RouterLink} to="/store" color="forest.600" _hover={{ textDecoration: 'underline' }}>
                TypeScript support
              </Text>
            </HStack>
          </VStack>
          <Button as={RouterLink} to="/store" colorScheme="forest" size="lg" w="full">
            Start with Essentials
          </Button>
        </Section>

        <Section>
          <HStack>
            <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
              Power Tools
            </Badge>
            <Text fontSize="sm" color="gray.500">
              When you need more
            </Text>
          </HStack>
          <Heading size="lg" color="purple.700">
            Advanced capabilities
          </Heading>
          <Text color="gray.600">
            Unlock advanced features for complex applications: validation, transactions, and
            reactive patterns.
          </Text>
          <VStack align="start" spacing={2} fontSize="sm">
            <HStack>
              <Text>🔧</Text>
              <Text as={RouterLink} to="/validation" color="purple.600" _hover={{ textDecoration: 'underline' }}>
                Built-in validation system
              </Text>
            </HStack>
            <HStack>
              <Text>🔧</Text>
              <Text as={RouterLink} to="/transactions" color="purple.600" _hover={{ textDecoration: 'underline' }}>
                Atomic transactions with rollback
              </Text>
            </HStack>
            <HStack>
              <Text>🔧</Text>
              <Text as={RouterLink} to="/rxjs" color="purple.600" _hover={{ textDecoration: 'underline' }}>
                RxJS reactive programming
              </Text>
            </HStack>
            <HStack>
              <Text>🔧</Text>
              <Text as={RouterLink} to="/examples" color="purple.600" _hover={{ textDecoration: 'underline' }}>
                Advanced patterns & debugging
              </Text>
            </HStack>
          </VStack>
          <Button
            as={RouterLink}
            to="/validation"
            colorScheme="purple"
            variant="outline"
            size="lg"
            w="full"
          >
            Explore Power Tools
          </Button>
        </Section>
      </SimpleGrid>

      {/* Quick Start */}
      <Box mb={12}>
        <Heading size="lg" mb={6}>
          Quick Start
        </Heading>
        <CodeTabs tabs={quickStartTabs} />
      </Box>

      {/* Live Demo */}
      <Section title="Live Demo">
        <Text color="gray.600">Try out Forestry 4 with this interactive counter example:</Text>

        <Box p={6} bg="gray.100" borderRadius="md" textAlign="center" minW="300px">
          <Text fontSize="3xl" fontWeight="bold" color="forest.600" mb={4}>
            {count}
          </Text>
          <HStack spacing={4} justify="center">
            <Button colorScheme="forest" onClick={() => store?.$.increment()} disabled={!store}>
              +1
            </Button>
            <Button variant="outline" onClick={() => store?.$.decrement()} disabled={!store}>
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
                snippet: 'demo-store-definition',
                folder: 'home',
                ts: true,
              },
              {
                label: 'React Integration',
                language: 'tsx',
                snippet: 'demo-react-integration',
                folder: 'home',
              },
              {
                label: 'JSX Template',
                language: 'tsx',
                snippet: 'demo-jsx-template',
                folder: 'home',
              },
            ]}
          />
        </VStack>
      </Section>
    </Container>
  );
};

export default Home;
