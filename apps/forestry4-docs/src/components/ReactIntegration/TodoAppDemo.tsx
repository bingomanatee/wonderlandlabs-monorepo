import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  CloseButton,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import useForestryLocal from '@/hooks/useForestryLocal';
import { createTodoStore, TodoState } from '@/storeFactories/createTodoStore.ts';
import CountBadge from '@/components/CountBadge.tsx';

const TodoAppDemo: React.FC = () => {
  // Use useForestryLocal hook instead of manual subscription
  const [todoValue, todoStore] = useForestryLocal<TodoState>(createTodoStore);

  // Early return if state is not yet loaded
  if (!todoValue) {
    return <Text>Loading...</Text>;
  }
  const filteredTodos = todoStore.filteredTodos;

  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
      <VStack spacing={4} align="stretch">
        <HStack width="full" justify="between">
          <Heading variant="card" flex={1}>
            Todo List
          </Heading>
          {todoStore.completedCount > 0 ? (
            <Button
              size="sm"
              colorScheme="red"
              variant="solid"
              disabled={!todoStore.completedCount}
              onClick={todoStore.$.clearCompleted}
            >
              Clear Completed
              <CountBadge>{todoStore.completedCount}</CountBadge>
            </Button>
          ) : null}
        </HStack>

        <Box
          maxH="400px"
          overflowY="auto"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          p={4}
        >
          {filteredTodos.length === 0 ? (
            <Text color="gray.500" fontStyle="italic" textAlign="center">
              {todoValue.filter === 'all'
                ? 'No todos yet!'
                : todoValue.filter === 'active'
                  ? 'No active todos!'
                  : 'No completed todos!'}
            </Text>
          ) : (
            <VStack spacing={3} align="stretch">
              {filteredTodos.map((todo) => (
                <HStack key={todo.id} p={3} bg="gray.50" borderRadius="md">
                  <Checkbox
                    isChecked={todo.completed}
                    title="click to complete task"
                    onChange={() => todoStore.$.toggleTodo(todo.id)}
                  />
                  <Text
                    flex={1}
                    textDecoration={todo.completed ? 'line-through' : 'none'}
                    color={todo.completed ? 'gray.500' : 'inherit'}
                  >
                    {todo.text}
                  </Text>
                  <CloseButton
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => todoStore.$.removeTodo(todo.id)}
                  />
                </HStack>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>
      <VStack spacing={4} align="stretch">
        <Box>
          <Heading variant="card">Add New Todo</Heading>
          <HStack>
            <Input
              name="newTodoText"
              placeholder="What needs to be done?"
              value={todoValue.newTodoText}
              onChange={todoStore.$.onChange}
              okKeyUp={todoStore.$.handleKeyPress}
            />
            <Button
              colorScheme="forest"
              onClick={todoStore.$.addTodo}
              isDisabled={!todoStore.newTodoTextIsValid}
            >
              Add
            </Button>
          </HStack>
          {!todoValue.newTodoText || todoStore.newTodoTextIsValid ? null : (
            <Text color="red">{todoStore.newTodoErrors}</Text>
          )}
        </Box>

        <Box>
          <Heading variant="card">Filter Todos</Heading>
          <HStack>
            <Button
              size="sm"
              variant={todoValue.filter === 'all' ? 'solid' : 'outline'}
              colorScheme="forest"
              onClick={todoStore.$.setFilterAll}
            >
              Show All Tasks
              {todoValue.todos.length && <CountBadge>{todoValue.todos.length}</CountBadge>}
            </Button>
            <Button
              size="sm"
              variant={todoValue.filter === 'active' ? 'solid' : 'outline'}
              colorScheme="forest"
              onClick={todoStore.$.setFilterActive}
            >
              Active
              {todoStore.activeCount ? <CountBadge>{todoStore.activeCount}</CountBadge> : null}
            </Button>
            <Button
              size="sm"
              variant={todoValue.filter === 'completed' ? 'solid' : 'outline'}
              colorScheme="forest"
              onClick={todoStore.$.setFilterCompleted}
            >
              Completed
              {todoStore.completedCount ? (
                <CountBadge>{todoStore.completedCount}</CountBadge>
              ) : null}
            </Button>
          </HStack>
        </Box>
      </VStack>
    </SimpleGrid>
  );
};

export default TodoAppDemo;
