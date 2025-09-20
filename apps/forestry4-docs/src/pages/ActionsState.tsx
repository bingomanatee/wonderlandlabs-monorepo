import React from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import CodeTabs from '../components/CodeTabs.tsx';
import SnippetBlock from '../components/SnippetBlock';
import CounterDemo from '../components/ActionsState/CounterDemo';
import CodeBlock from '../components/CodeBlock';
import ItemDef from '../components/ItemDef';
import Section from '../components/Section';

const ActionsState: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={4}>
            Actions & State Management
            <Badge ml={3} colorScheme="forest">
              Essential
            </Badge>
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Learn how to define actions and manage state updates in Forestry 4.
          </Text>
        </Box>

        {/* Action Principles */}
        <Section title="Action Principles">
          <Text color="gray.600">
            Understanding the core principles of actions will help you write better, more
            maintainable state management code.
          </Text>

          <Alert status="warning">
            <AlertIcon />
            <VStack spacing={2} align="stretch">
              <Text fontSize="sm" fontWeight="bold">
                🚨 Forestry is NOT Redux!
              </Text>
              <Text fontSize="sm">
                Actions don't return the next state iteration. State is changed imperatively with
                <code>next</code>, <code>set</code>, and <code>mutate</code>. Actions don't even
                have to return anything. When they do return values, it's useful data for the caller
                (summaries, composites, reporting) - not values that Forestry itself uses.
              </Text>
            </VStack>
          </Alert>

          <Alert status="info">
            <AlertIcon />
            <Text fontSize="sm">
              <strong>Key Rule:</strong> Actions must be functions or object methods - NOT arrow
              functions/lambdas. Arrow functions cannot be properly bound with <code>call</code> and
              will lose their <code>this</code> context.
            </Text>
          </Alert>

          <Heading size="md">Why not use general functions?</Heading>
          <VStack spacing={2} align="stretch">
            <Box layerStyle="card">
              Actions are not "magic" - they are bound to the state's context like class instance
              methods but you can if you prefer use <i>external functions</i> instead of actions and
              just pass state as an argument and modify the state from the outside.
            </Box>
          </VStack>
          <Heading size="md">Can actions be async?</Heading>
          <VStack spacing={2} align="stretch">
            <Box layerStyle="card">
              Yes - even external ones can be async. However a few considerations:
              <ul>
                <li>
                  Transactions cannot contain async actions. Its just not tenable to implement
                  rollback and async behavior in the same system. however you can call (sync)
                  transactions from <i>inside</i> an async function.
                </li>
                <li>You may find it slightly more work to test external functions.</li>
                <li>
                  You can use external "helper functions" like lodash utilities, inside an action
                  provided they can handle immutable inputs
                </li>
              </ul>
            </Box>
          </VStack>

          <Heading size="md">What is an action?</Heading>

          <VStack spacing={4} align="stretch">
            <Box layerStyle="card">
              <Text fontWeight="semibold" mb={2}>
                Actions Have Two Purposes
              </Text>
              <ul>
                <Text fontSize="sm" as="li">
                  <strong>State Mutation:</strong> Update the store's value using mutate, set, or
                  next
                </Text>
                <Text fontSize="sm" as="li">
                  <strong>Selectors/Computed Values:</strong> you can express summary or portions of
                  state out of actions and return it to the calling context.
                </Text>
              </ul>
            </Box>

            <Box layerStyle="card" bg="gray.50">
              <Text fontWeight="semibold" mb={2}>
                Actions are bound to the Store
              </Text>
              <Text fontSize="sm">
                <code>this</code> in actions refers to the store itself. You can use{' '}
                <code>this.$</code>,<code>this.set</code>, <code>this.next</code>,{' '}
                <code>this.value</code>, etc.
              </Text>
            </Box>
          </VStack>
          <Heading size="md">The Value parameter</Heading>
          <VStack spacing={2} align="stretch">
            <Box layerStyle="card">
              <Text fontSize="sm">
                The first parameter <code>value</code> is the state's value property,{' '}
                <i>when the action started</i> . If your action changes state and you want to get
                the most current version of state, examine <code>this.value</code> or{' '}
                <code>this.get('path')</code> to get the latest state value.
                <br />
                <br />
                You <i>must</i> add it as the first parameter in your action, but when you{' '}
                <i>call</i> your action, you don't have to add it in - Forestry will automatically
                prepend it to any input arguments internally.
                <SnippetBlock
                  snippetName="counter-example"
                  folder="actions-state"
                  language="typescript"
                  ts={true}
                />
              </Text>
            </Box>
          </VStack>

          <Heading size={'md'}>How to update state</Heading>
          <VStack spacing={4} align="stretch">
            <Alert status="info">
              <AlertIcon />
              <Text fontSize="sm">
                Unlike Redux, <strong>the return value of actions does NOT update state</strong>.
                Updating state is done imperatively by calling state methods.
              </Text>
            </Alert>

            <ItemDef
              title="set(path: string | string[], value: any): void"
              titleAsCode={true}
              snippetName="set-examples"
              snippetFolder="actions-state"
              language="typescript"
              ts={true}
            >
              Sets a property in the state structure with a new value. Path can be a string or
              dot-separated deep path.
            </ItemDef>

            <ItemDef
              title="mutate(updater: (draft: T) => void | T): void"
              titleAsCode={true}
              snippetName="mutate-examples"
              snippetFolder="actions-state"
              language="typescript"
              ts={true}
            >
              Allows you to edit the state as a normal mutable JavaScript object using Immer's
              produce function.
            </ItemDef>

            <ItemDef
              title="next(value: T): void"
              titleAsCode={true}
              snippetName="next-examples"
              snippetFolder="actions-state"
              language="typescript"
              ts={true}
            >
              Replaces the entire state with a new value. Generally the least useful method - prefer
              set() or mutate() for most cases.
            </ItemDef>
          </VStack>
        </Section>

        {/* Action Patterns */}
        <Section title="Action Patterns in Practice">
          <Box layerStyle="card">
            <Text>
              Practical examples showing the recommended patterns for different types of state
              updates.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Box>
              <Heading size="md" mb={3}>
                Actions can call othe ractions
              </Heading>
              <Text color="gray.600" mb={4}>
                High-level actions that orchestrate multiple tactical operations.
              </Text>
              <SnippetBlock snippetName="strategicActions" folder="ActionsState" />
            </Box>

            <Box>
              <Heading size="md" mb={3}>
                Tactical Actions
              </Heading>
              <Text color="gray.600" mb={4}>
                Low-level, reusable utilities that handle specific mutations.
              </Text>
              <SnippetBlock snippetName="tacticalActions" folder="ActionsState" />
            </Box>
          </SimpleGrid>
        </Section>
        {/* Live Demo */}
        <Section title="Interactive Actions Demo">
          <Text color="gray.600">
            Try different action patterns and see how they update the state:
          </Text>

          <CounterDemo />
        </Section>

        {/* Source Code */}
        <Section title="Complete Source Code">
          <Text color="gray.600">
            Here's the complete implementation of the actions demo above:
          </Text>

          <CodeTabs
            tabs={[
              {
                label: 'Store Definition',
                language: 'typescript',
                snippet: 'storeDefinition',
                folder: 'ActionsState',
              },
              {
                label: 'React Integration',
                language: 'tsx',
                snippet: 'reactIntegrationDemo',
                folder: 'ActionsState',
              },
              {
                label: 'Action Patterns',
                language: 'typescript',
                snippet: 'actionPatterns',
                folder: 'ActionsState',
              },
            ]}
          />
        </Section>

        {/* Best Practices */}
        <Section title="Action Best Practices">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Box>
              <Heading size="md" mb={3} color="green.600">
                ✅ Best Practices for Actions
              </Heading>
              <VStack spacing={3} align="stretch">
                <Box p={3} bg="green.50" borderRadius="md">
                  <Text fontWeight="semibold">Keep actions focused</Text>
                  <Text fontSize="sm" color="gray.600">
                    One action should do one thing well; take advantage of nested actions to break
                    up complex behaviors into several small helpers
                  </Text>
                </Box>
                <Box p={3} bg="green.50" borderRadius="md">
                  <Text fontWeight="semibold">Compose with nested actions</Text>
                  <Text fontSize="sm" color="gray.600">
                    <code>this.$.otherAction()</code> for reusability
                  </Text>
                </Box>
                <Box p={3} bg="green.50" borderRadius="md">
                  <Text fontWeight="semibold">Use actions in place of hooks or wrappers</Text>
                  <Text fontSize="sm" color="gray.600">
                    Because actions are bound to store context you can use them directly to respond
                    to events - you don't have to wrap them in lambdas or <code>useCallback</code>.
                    You can write actions to deconstruct events and pass them directly to{' '}
                    <code>onChange(state.$.onFieldChange</code>. You can even attach data-keys to
                    qualify the behavior of the actions to reduce having to write new handlers for
                    each event use case.
                  </Text>
                </Box>
              </VStack>
            </Box>

            <Box>
              <Heading size="md" mb={3} color="red.600">
                ❌ Things that won't work
              </Heading>
              <VStack spacing={3} align="stretch">
                <Box p={3} bg="red.50" borderRadius="md">
                  <Text fontWeight="semibold">You cannot edit the value parameter</Text>
                  <Text fontSize="sm" color="gray.600">
                    the value parameter <i>and</i> <code>this.value</code> are both
                    <a href="https://immerjs.github.io/immer/">Immer</a> immutables that{' '}
                    <i>cannot be edited</i> - this is even "more const than const";
                    <code>Map.set</code> or <code>array.push/pop/etc</code> do not work on values.
                    (this by the way is also true of Redux Toolkit actions).
                    <br />
                    <br />
                    The <code>.mutate(lambda)</code> method is how you can directly edit state
                    value.
                  </Text>
                </Box>
                <Box p={3} bg="red.50" borderRadius="md">
                  <Text fontWeight="semibold">Actions cannot be arrow functions (lambdas)</Text>
                  <Text fontSize="sm" color="gray.600">
                    you cannot bind or change a lambdas' definiton of this so actions cannot be
                    bound to state from the constructor definitions: eg.,
                    <SnippetBlock
                      snippetName="arrow-function-antipattern"
                      folder="actions-state"
                      language="typescript"
                      ts={true}
                    />
                    will not give you the desired result as "this" will not be the store.
                  </Text>
                </Box>
              </VStack>
            </Box>
          </SimpleGrid>
        </Section>
      </VStack>
    </Container>
  );
};

export default ActionsState;
