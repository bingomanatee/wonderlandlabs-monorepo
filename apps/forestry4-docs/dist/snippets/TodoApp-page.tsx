// Auto-generated snippet from: apps/forestry4-docs/src/pages/examples/TodoApp.tsx
// Description: TodoApp example page component
// Last synced: Sat Sep 20 11:39:50 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Container,
  Heading,
  List,
  ListIcon,
  ListItem,
  Text,
  VStack,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import TodoAppDemo from '../../components/ReactIntegration/TodoAppDemo';
import CodeBlock from '../../components/CodeBlock';
import PageTitle from '../../components/PageTitle';
import Section from '@/components/Section.tsx';

const TodoApp: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <PageTitle>Todo App example </PageTitle>
      <VStack layerStyle="section" spacing={8}>
        {/* Header */}
        <Box textAlign="center">
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            A fully-featured todo application demonstrating Forestry 4's action-based architecture,
            form handling, filtering, and React integration patterns.
          </Text>
        </Box>

        {/* Key Features */}
        <Section titleSize="md" title={'Key Features Demonstrated'}>
          <List spacing={2}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Action-Based Architecture:</strong> All logic encapsulated in store actions
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Computed Values as Actions:</strong> filteredTodos(), completedCount(),
              activeCount()
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Tactical Form Handling:</strong> onChange action using event.target.name
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Event Handler Actions:</strong> All onClick/onChange handlers are store
              methods
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>useForestryLocal Integration:</strong> Clean hook-based state management
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Validation:</strong> Built-in tests for input validation
            </ListItem>
          </List>
        </Section>

        {/* Live Demo */}
        <Section title="Live Demo" titleSize="md">
          <Text mb={4} color="gray.600">
            Try the todo app below. Notice how all interactions are handled through store actions,
            and the component is purely presentational.
          </Text>
          <TodoAppDemo />
        </Section>

        {/* Architecture Highlights */}
        <Box layerStyle="methodCard" w="full">
          <Heading variant="card">
            Architecture Highlights
          </Heading>

          <Alert status="info" mb={4}>
            <AlertIcon />
            This example demonstrates the ultimate Forestry pattern where the React component is
            purely declarative JSX with zero business logic.
          </Alert>

          <VStack spacing={4} align="stretch">
            <Box>
              <Heading variant="subtle">
                Pure Component Pattern
              </Heading>
              <Text fontSize="sm" color="gray.600">
                The React component contains no business logic, state management, or event handling
                code. Everything is delegated to store actions.
              </Text>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>
                Action Categories
              </Heading>
              <List spacing={1} fontSize="sm">
                <ListItem>
                  <strong>Data Actions:</strong> addTodo, toggleTodo, removeTodo, setFilter,
                  clearCompleted
                </ListItem>
                <ListItem>
                  <strong>UI Actions:</strong> setFilterAll, setFilterActive, setFilterCompleted,
                  handleKeyPress
                </ListItem>
                <ListItem>
                  <strong>Selector Actions:</strong> filteredTodos, completedCount, activeCount,
                  isAddDisabled
                </ListItem>
                <ListItem>
                  <strong>Factory Actions:</strong> createToggleTodo, createRemoveTodo (for
                  parameterized handlers)
                </ListItem>
              </List>
            </Box>

            <Box>
              <Heading variant="subtle">
                Inline Function Calls
              </Heading>
              <Text fontSize="sm" color="gray.600">
                All computed values and event handlers use direct action references without arrow
                functions, resulting in cleaner JSX and better performance.
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* Code Structure */}
        <Box layerStyle="methodCard" w="full">
          <Heading variant="card">
            Store Structure
          </Heading>
          <CodeBlock language="typescript" title="Store Factory Pattern" snippet="todoStoreFactoryPattern" />
        </Box>

        {/* Component Usage */}
        <Box layerStyle="methodCard" w="full">
          <Heading variant="card">
            Component Usage
          </Heading>
          <CodeBlock language="typescript" title="Pure React Component">
            {`const TodoAppDemo: React.FC = () => {
  const [todoValue, todoStore] = useForestryLocal<TodoState>(createTodoStore);

  if (!todoValue) {
    return <Text>Loading...</Text>;
  }

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
      <VStack spacing={4} align="stretch">
        <Input
          name="newTodoText"
          value={todoValue.newTodoText}
          onChange={todoStore.$.onChange}
          onKeyPress={todoStore.$.handleKeyPress}
        />
        <Button
          onClick={todoStore.$.addTodo}
          isDisabled={todoStore.$.isAddDisabled()}
        >
          Add
        </Button>
        
        <Button onClick={todoStore.$.setFilterAll}>
          All ({todoValue.todos.length})
        </Button>
        <Button onClick={todoStore.$.setFilterActive}>
          Active ({todoStore.$.activeCount()})
        </Button>
        
        {todoStore.$.filteredTodos().map((todo) => (
          <HStack key={todo.id}>
            <Checkbox
              isChecked={todo.completed}
              onChange={todoStore.$.createToggleTodo(todo.id)}
            />
            <Text>{todo.text}</Text>
            <Button onClick={todoStore.$.createRemoveTodo(todo.id)}>
              ×
            </Button>
          </HStack>
        ))}
      </VStack>
    </SimpleGrid>
  );
};`}
          </CodeBlock>
        </Box>

        {/* Best Practices */}
        <Box layerStyle="methodCard" w="full">
          <Heading variant="card">
            Best Practices Demonstrated
          </Heading>
          <List spacing={3}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Store Factory Pattern:</strong> Use factory functions with useForestryLocal
              for clean component integration
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Action-Based Selectors:</strong> Computed values as actions rather than React
              useMemo
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Tactical Form Handling:</strong> Single onChange action using
              event.target.name pattern
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Direct Action References:</strong> Avoid arrow functions in JSX for better
              performance
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Minimal State:</strong> Store only essential data, compute derived values
              on-demand
            </ListItem>
          </List>
        </Box>
      </VStack>
    </Container>
  );
};

export default TodoApp;
