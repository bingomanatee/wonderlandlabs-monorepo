import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Card,
  CardBody,
  SimpleGrid,
  Alert,
  AlertIcon,
  Code,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import SnippetBlock from '../components/SnippetBlock';
import CodeTabs from '../components/CodeTabs.tsx';
import Section from '../components/Section';

const StoreValue: React.FC = () => {
  return (
    <Box maxW="6xl" mx="auto" p={6}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Store Value & Res Map
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto">
            Understanding the store's value property and res map - their capabilities, limitations,
            and proper usage patterns in Forestry stores.
          </Text>
        </Box>

        {/* Store Value Fundamentals */}
        <Section>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Store Value Fundamentals</Heading>

            <Alert status="info">
              <AlertIcon />
              <Box>
                <Text fontWeight="semibold">The Value is Immer-Powered</Text>
                <Text fontSize="sm" mt={1}>
                  Store values are processed through Immer, providing immutable updates with
                  mutable-style syntax in actions.
                </Text>
              </Box>
            </Alert>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Box layerStyle="card" bg="blue.50">
                <Heading size="md" mb={2} color="blue.700">
                  Immer Integration
                </Heading>
                <Text fontSize="sm">
                  All state changes go through Immer's proxy system, enabling safe "mutations" that
                  actually create new immutable versions.
                </Text>
              </Box>

              <Box layerStyle="card" bg="purple.50">
                <Heading size="md" mb={2} color="purple.700">
                  No Prototype Preservation
                </Heading>
                <Text fontSize="sm">
                  Class instances lose their prototypical inheritance. Store only plain data -
                  objects, arrays, primitives, Maps, and Sets.
                </Text>
              </Box>

              <Box layerStyle="card" bg="orange.50">
                <Heading size="md" mb={2} color="orange.700">
                  Flexible Value Types
                </Heading>
                <Text fontSize="sm">
                  Values don't have to be objects. You can store primitives, arrays, Maps, Sets, or
                  any JSON-serializable data structure.
                </Text>
              </Box>

              <Box layerStyle="card" bg="red.50">
                <Heading size="md" mb={2} color="red.700">
                  No Reference Preservation
                </Heading>
                <Text fontSize="sm">
                  Don't store DOM elements, functions, or objects that rely on reference equality.
                  Immer creates new references on each update.
                </Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </Section>

        {/* Value Type Examples */}
        <Section>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Value Type Examples</Heading>
            <Text color="gray.600">
              Store values can be any serializable data type. Here are common patterns:
            </Text>

            <CodeTabs
              tabs={[
                {
                  label: 'Object Values',
                  language: 'typescript',
                  snippet: 'objectValues',
                  folder: 'StoreValue',
                },
                {
                  label: 'Primitive Values',
                  language: 'typescript',
                  snippet: 'primitiveValues',
                  folder: 'StoreValue',
                },
                {
                  label: 'Array Values',
                  language: 'typescript',
                  snippet: 'arrayValues',
                  folder: 'StoreValue',
                },
                {
                  label: 'Map & Set Values',
                  language: 'typescript',
                  snippet: 'mapSetValues',
                  folder: 'StoreValue',
                },
              ]}
            />
          </VStack>
        </Section>

        {/* Value Limitations */}
        <Section>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Value Limitations & Gotchas</Heading>

            <Alert status="warning">
              <AlertIcon />
              <Box>
                <Text fontWeight="semibold">What NOT to Store in Value</Text>
                <UnorderedList mt={2} spacing={1}>
                  <ListItem>DOM elements or React components</ListItem>
                  <ListItem>Functions or class instances</ListItem>
                  <ListItem>Objects that rely on reference equality</ListItem>
                  <ListItem>Circular references or complex object graphs</ListItem>
                </UnorderedList>
              </Box>
            </Alert>

            <SnippetBlock snippetName="valueLimitations" folder="StoreValue" />
          </VStack>
        </Section>

        {/* Res Map */}
        <Section>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">The Res Map - Non-Serializable Storage</Heading>

            <Text color="gray.600">
              The <Code>res</Code> map is for storing complex, non-serializable objects that actions
              need access to but shouldn't be part of the reactive state.
            </Text>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Box layerStyle="card" bg="green.50">
                <Heading size="md" mb={2} color="green.700">
                  Non-Reactive Storage
                </Heading>
                <Text fontSize="sm">
                  Changes to res don't trigger subscribers. It's a utility storage space for complex
                  objects that actions need.
                </Text>
              </Box>

              <Box layerStyle="card" bg="blue.50">
                <Heading size="md" mb={2} color="blue.700">
                  Any Value Type
                </Heading>
                <Text fontSize="sm">
                  Store DOM elements, class instances, functions, or any complex object that can't
                  be serialized in the main value.
                </Text>
              </Box>
            </SimpleGrid>

            <SnippetBlock snippetName="resMapUsage" folder="StoreValue" />
          </VStack>
        </Section>

        {/* Best Practices */}
        <Section>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Best Practices</Heading>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Box>
                <Heading size="md" mb={3} color="green.600">
                  ✅ Do
                </Heading>
                <VStack spacing={3} align="stretch">
                  <Box layerStyle="highlight" bg="green.50">
                    <Text fontWeight="semibold">Store plain data in value</Text>
                    <Text fontSize="sm" color="gray.600">
                      Objects, arrays, primitives, Maps, Sets - serializable data only
                    </Text>
                  </Box>
                  <Box layerStyle="highlight" bg="green.50">
                    <Text fontWeight="semibold">Use res for complex objects</Text>
                    <Text fontSize="sm" color="gray.600">
                      DOM elements, class instances, functions go in res map
                    </Text>
                  </Box>
                  <Box layerStyle="highlight" bg="green.50">
                    <Text fontWeight="semibold">Design for immutability</Text>
                    <Text fontSize="sm" color="gray.600">
                      Structure data assuming references will change on updates
                    </Text>
                  </Box>
                </VStack>
              </Box>

              <Box>
                <Heading size="md" mb={3} color="red.600">
                  ❌ Don't
                </Heading>
                <VStack spacing={3} align="stretch">
                  <Box layerStyle="highlight" bg="red.50">
                    <Text fontWeight="semibold">Store class instances in value</Text>
                    <Text fontSize="sm" color="gray.600">
                      They lose prototypical inheritance through Immer
                    </Text>
                  </Box>
                  <Box layerStyle="highlight" bg="red.50">
                    <Text fontWeight="semibold">Rely on reference equality</Text>
                    <Text fontSize="sm" color="gray.600">
                      Immer creates new references - use IDs for identity
                    </Text>
                  </Box>
                  <Box layerStyle="highlight" bg="red.50">
                    <Text fontWeight="semibold">Expect res changes to notify</Text>
                    <Text fontSize="sm" color="gray.600">
                      Res is non-reactive - subscribers won't be notified
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Section>
      </VStack>
    </Box>
  );
};

export default StoreValue;
