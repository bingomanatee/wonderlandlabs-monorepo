import React from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import CodeTabs from '../components/CodeTabs.tsx';
import Section from '../components/Section';
import LiveCounterDemo from '../components/home/LiveCounterDemo';

const Home: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      {/* Hero Section */}{' '}
      <HStack spacing={2} width="full" justify="space-between" align="flex-start">
        <Button as={RouterLink} to="/why" colorScheme="forest" size="lg">
          Why Forestry?
        </Button>
        <VStack spacing={2} textAlign="center" mb={6}>
          <HStack align="center" gap={6}>
            <Image w="64px" h="64px" src="/img/logo.png" />
            <Heading size="2xl" color="gray.800" m={0}>
              Forestry 4.0
            </Heading>
          </HStack>

          <Box>
            <Text textStyle="hero">A simple, powerful state management library for React.</Text>
            <Text textStyle="hero">
              Forestry allows you to collect instances that manage values with predefined schema and
              modify them with custom methods. It allows you to create control systems that are
              faster, more consistent, and more reliable update systems.
            </Text>
            <Text textStyle="hero">
              It is designed not only to supercharge short term execution but to enhance project
              evolution including testing, variation, and delegation.
            </Text>
          </Box>
        </VStack>
        <Button as={RouterLink} to="/store" variant="outline" size="lg">
          Get Started
        </Button>
      </HStack>
      {/* Essential vs Power Tools */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={12}>
        <Section>
          <VStack spacing={0}>
            <Heading size="lg" color="forest.700" my={2}>
              Get productive in 5 minutes
            </Heading>
            <Text color="gray.600">
              Everything you need to manage state in React applications. Simple, predictable, and
              powerful.
            </Text>
          </VStack>
          <VStack align="start" spacing={2} fontSize="sm">
            <HStack>
              <Text>✅</Text>
              <Text
                as={RouterLink}
                to="/store"
                color="forest.600"
                _hover={{ textDecoration: 'underline' }}
              >
                Create stores with initial state
              </Text>
            </HStack>
            <HStack>
              <Text>✅</Text>
              <Text
                as={RouterLink}
                to="/actions"
                color="forest.600"
                _hover={{ textDecoration: 'underline' }}
              >
                Define actions for state updates
              </Text>
            </HStack>
            <HStack>
              <Text>✅</Text>
              <Text
                as={RouterLink}
                to="/react"
                color="forest.600"
                _hover={{ textDecoration: 'underline' }}
              >
                React hooks integration
              </Text>
            </HStack>
            <HStack>
              <Text>✅</Text>
              <Text
                as={RouterLink}
                to="/store"
                color="forest.600"
                _hover={{ textDecoration: 'underline' }}
              >
                TypeScript support
              </Text>
            </HStack>
          </VStack>
        </Section>

        <Section>
          <VStack spacing={0} align="start">
            <Heading size="lg" color="purple.700" my={2}>
              Advanced capabilities
            </Heading>
            <Text color="gray.600">
              Unlock advanced features for complex applications: validation, transactions, and
              reactive patterns.
            </Text>
          </VStack>
          <VStack align="start" spacing={2} fontSize="sm">
            <HStack>
              <Text>🔧</Text>
              <Text
                as={RouterLink}
                to="/validation"
                color="purple.600"
                _hover={{ textDecoration: 'underline' }}
              >
                Built-in validation system
              </Text>
            </HStack>
            <HStack>
              <Text>🔧</Text>
              <Text
                as={RouterLink}
                to="/transactions"
                color="purple.600"
                _hover={{ textDecoration: 'underline' }}
              >
                Atomic transactions with rollback
              </Text>
            </HStack>
            <HStack>
              <Text>🔧</Text>
              <Text
                as={RouterLink}
                to="/rxjs"
                color="purple.600"
                _hover={{ textDecoration: 'underline' }}
              >
                RxJS reactive programming
              </Text>
            </HStack>
            <HStack>
              <Text>🔧</Text>
              <Text
                as={RouterLink}
                to="/examples"
                color="purple.600"
                _hover={{ textDecoration: 'underline' }}
              >
                Advanced patterns & debugging
              </Text>
            </HStack>
          </VStack>
        </Section>
      </SimpleGrid>
      {/* Live Demo */}
      <Section title="Example - basic counter">
        <LiveCounterDemo />

        <Divider />

        <CodeTabs
          tabs={[
            {
              label: 'Store Factory',
              language: 'typescript',
              snippet: 'demo-store-definition',
              folder: 'home',
            },

            {
              label: 'Component',
              language: 'tsx',
              snippet: 'demo-jsx-template',
              folder: 'home',
            },
          ]}
        />
      </Section>
    </Container>
  );
};

export default Home;
