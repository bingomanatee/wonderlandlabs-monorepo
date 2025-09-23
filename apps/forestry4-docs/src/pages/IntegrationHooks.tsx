import React from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Heading,
  ListItem,
  SimpleGrid,
  Text,
  UnorderedList,
  VStack,
} from '@chakra-ui/react';
import CodeBlock from '../components/CodeBlock';
import CodeTabs from '../components/CodeTabs.tsx';
import Section from '../components/Section';

const IntegrationHooks: React.FC = () => {
  return (
    <Box maxW="6xl" mx="auto" p={6}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Integration Hooks
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto">
            Forestry provides specialized React hooks for seamless integration with stores and
            forests. These hooks handle subscription management, cleanup, and reactive updates
            automatically.
          </Text>
        </Box>

        {/* useForestryLocal Hook */}
        <Section>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">useForestryLocal Hook</Heading>

            <Text color="gray.600">
              The primary hook for subscribing to Forestry stores in React components. Automatically
              handles subscription lifecycle and provides reactive state updates.
            </Text>

            <Alert status="info">
              <AlertIcon />
              <Box>
                <Text fontWeight="semibold">Automatic Subscription Management</Text>
                <Text fontSize="sm" mt={1}>
                  Subscribes on mount, unsubscribes on unmount, and re-subscribes when store
                  changes. No manual cleanup required.
                </Text>
              </Box>
            </Alert>

            <Heading>React Middleware Hooks</Heading>
            <Text>
              Here are some hooks that I use to transport stores into React components. Forestry
              stores can be used in two contexts - locally to replace hooks, or globally, as in for
              a login/auth store, to replace Redux.
            </Text>
            <Text>
              <b>Local stores</b> expect a factory function that outputs a Store or Forest instance.
              <b>Global Stores</b> are produced using singletons in a module file; you can import
              them into any component but you must observe their values into a local state; the{' '}
              <code>useObserveForest</code> custom hook takes care of that for you, but you can
              explode its functionality locally into a single useState and useEffect.
            </Text>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Box>
                <Heading size="md" mb={3}>
                  useForestryLocal - Example
                </Heading>
                <CodeBlock
                  language="typescript"
                  snippetName="useForestryLocalExample"
                  folder="IntegrationHooks"
                />
              </Box>

              <Box>
                <Heading size="md" mb={3}>
                  useForestryLocal - source
                </Heading>
                <CodeBlock
                  language="typescript"
                  snippetName="useForestryLocalSource"
                  folder="IntegrationHooks"
                />
              </Box>
            </SimpleGrid>
          </VStack>
        </Section>

        {/* useObserveForest Hook */}
        <Section>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">useObserveForest Hook</Heading>

            <Text color="gray.600">
              Observes Forest instances for reactive updates without creating branches. Useful for
              read-only subscriptions to forest state changes.
            </Text>

            <Alert status="warning">
              <AlertIcon />
              <Box>
                <Text fontWeight="semibold">Read-Only Observation</Text>
                <Text fontSize="sm" mt={1}>
                  This hook only observes forest changes. Use useForestBranch if you need to create
                  branches or modify forest state.
                </Text>
              </Box>
            </Alert>

            <CodeTabs
              tabs={[
                {
                  label: 'Usage Example',
                  language: 'typescript',
                  snippet: 'useObserveForestExample',
                  folder: 'IntegrationHooks',
                },
                {
                  label: 'Full Source Code',
                  language: 'typescript',
                  snippet: 'useObserveForestSource',
                  folder: 'IntegrationHooks',
                },
              ]}
            />
          </VStack>
        </Section>

        {/* Hook Comparison */}
        <Section>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Hook Comparison</Heading>

            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              <Box layerStyle="card" bg="blue.50">
                <Heading size="md" mb={2} color="blue.700">
                  useForestryLocal
                </Heading>
                <UnorderedList fontSize="sm" spacing={1}>
                  <ListItem>Store subscription</ListItem>
                  <ListItem>Reactive state updates</ListItem>
                  <ListItem>Automatic cleanup</ListItem>
                  <ListItem>Most common hook</ListItem>
                </UnorderedList>
              </Box>

              <Box layerStyle="card" bg="green.50">
                <Heading size="md" mb={2} color="green.700">
                  useForestBranch
                </Heading>
                <UnorderedList fontSize="sm" spacing={1}>
                  <ListItem>Creates forest branches</ListItem>
                  <ListItem>Field-level state</ListItem>
                  <ListItem>Form integration</ListItem>
                  <ListItem>Independent validation</ListItem>
                </UnorderedList>
              </Box>

              <Box layerStyle="card" bg="purple.50">
                <Heading size="md" mb={2} color="purple.700">
                  useObserveForest
                </Heading>
                <UnorderedList fontSize="sm" spacing={1}>
                  <ListItem>Read-only observation</ListItem>
                  <ListItem>Forest state changes</ListItem>
                  <ListItem>No branch creation</ListItem>
                  <ListItem>Lightweight monitoring</ListItem>
                </UnorderedList>
              </Box>
            </SimpleGrid>
          </VStack>
        </Section>

        {/* Best Practices */}
        <Section>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Integration Hook Best Practices</Heading>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Box>
                <Heading size="md" mb={3} color="green.600">
                  ✅ Do
                </Heading>
                <VStack spacing={3} align="stretch">
                  <Box layerStyle="highlight" bg="green.50">
                    <Text fontWeight="semibold">Use useForestryLocal for stores</Text>
                    <Text fontSize="sm" color="gray.600">
                      Primary hook for store subscriptions in components
                    </Text>
                  </Box>
                  <Box layerStyle="highlight" bg="green.50">
                    <Text fontWeight="semibold">Use useForestBranch for forms</Text>
                    <Text fontSize="sm" color="gray.600">
                      Perfect for field-level state management and validation
                    </Text>
                  </Box>
                  <Box layerStyle="highlight" bg="green.50">
                    <Text fontWeight="semibold">Memoize store creation</Text>
                    <Text fontSize="sm" color="gray.600">
                      Use useMemo to prevent store recreation on re-renders
                    </Text>
                  </Box>
                </VStack>
              </Box>

              <Box>
                <Heading size="md" mb={3} color="red.600">
                  ❌ These will not work
                </Heading>
                <VStack spacing={3} align="stretch">
                  <Box layerStyle="highlight" bg="red.50">
                    <Text fontWeight="semibold">Create stores in render</Text>
                    <Text fontSize="sm" color="gray.600">
                      Always memoize store creation, or attach it to a ref, to avoid memory leaks.
                    </Text>
                  </Box>
                  <Box layerStyle="highlight" bg="red.50">
                    <Text fontWeight="semibold">Mix hook types unnecessarily</Text>
                    <Text fontSize="sm" color="gray.600">
                      Choose the right hook for your use case
                    </Text>
                  </Box>
                  <Box layerStyle="highlight" bg="red.50">
                    <Text fontWeight="semibold">Forget dependency arrays</Text>
                    <Text fontSize="sm" color="gray.600">
                      Include store in useEffect dependencies when needed
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Section>
      </VStack>

      {/* useForestBranch Hook */}
      <Section>
        <VStack spacing={6} align="stretch">
          <Heading size="lg">useForestBranch Hook</Heading>

          <Text color="gray.600">
            Creates and manages Forest branches for field-level state management. Perfect for form
            fields and isolated component state.
          </Text>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Box layerStyle="card" bg="blue.50">
              <Heading size="md" mb={2} color="blue.700">
                Field-Level State
              </Heading>
              <Text fontSize="sm">
                Each form field gets its own branch with independent validation, error handling, and
                state management.
              </Text>
            </Box>

            <Box layerStyle="card" bg="green.50">
              <Heading size="md" mb={2} color="green.700">
                Automatic Cleanup
              </Heading>
              <Text fontSize="sm">
                Branches are automatically created on mount and cleaned up on unmount, preventing
                memory leaks in dynamic forms.
              </Text>
            </Box>
          </SimpleGrid>

          <CodeTabs
            tabs={[
              {
                label: 'Usage Example',
                language: 'typescript',
                snippet: 'useForestBranchExample',
                folder: 'IntegrationHooks',
              },
              {
                label: 'Full Source Code',
                language: 'typescript',
                snippet: 'useForestBranchSource',
                folder: 'IntegrationHooks',
              },
            ]}
          />
        </VStack>
      </Section>
    </Box>
  );
};

export default IntegrationHooks;
