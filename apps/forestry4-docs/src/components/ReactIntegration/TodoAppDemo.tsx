import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import useForestryLocal from '@/hooks/useForestryLocal';
import { createTodoStore, TodoState } from '@/storeFactories/createTodoStore.tsx';

const TodoAppDemo: React.FC = () => {
  // Use useForestryLocal hook instead of manual subscription
  const [todoValue, todoStore] = useForestryLocal<TodoState>(createTodoStore);

  // Early return if state is not yet loaded
  if (!todoValue) {
    return <Text>Loading...</Text>;
  }
  const filteredTodos = todoStore.$.filteredTodos();

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
      <VStack spacing={4} align="stretch">
        <Box>
          <Heading size="md" mb={4}>
            Add New Todo
          </Heading>
          <HStack>
            <Input
              name="newTodoText"
              placeholder="What needs to be done?"
              value={todoValue.newTodoText}
              onChange={todoStore.$.onChange}
              onKeyPress={todoStore.$.handleKeyPress}
            />
            <Button
              colorScheme="forest"
              onClick={todoStore.$.addTodo}
              isDisabled={todoStore.$.isAddDisabled()}
            >
              Add
            </Button>
          </HStack>
        </Box>

        <Box>
          <Heading size="md" mb={4}>
            Filter Todos
          </Heading>
          <HStack>
            <Button
              size="sm"
              variant={todoValue.filter === 'all' ? 'solid' : 'outline'}
              colorScheme="forest"
              onClick={todoStore.$.setFilterAll}
            >
              Show All ({todoValue.todos.length})
            </Button>
            <Button
              size="sm"
              variant={todoValue.filter === 'active' ? 'solid' : 'outline'}
              colorScheme="forest"
              onClick={todoStore.$.setFilterActive}
            >
              Show Active ({todoStore.$.activeCount()})
            </Button>
            <Button
              size="sm"
              variant={todoValue.filter === 'completed' ? 'solid' : 'outline'}
              colorScheme="forest"
              onClick={todoStore.$.setFilterCompleted}
            >
              Show Completed ({todoStore.$.completedCount()})
            </Button>
          </HStack>
        </Box>

        {todoStore.$.completedCount() > 0 && (
          <Box>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={todoStore.$.clearCompleted}
            >
              Clear Completed ({todoStore.$.completedCount()})
            </Button>
          </Box>
        )}
      </VStack>

      <VStack spacing={4} align="stretch">
        <Heading size="md">Todo List</Heading>
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
                    onChange={todoStore.$.createToggleTodo(todo.id)}
                  />
                  <Text
                    flex={1}
                    textDecoration={todo.completed ? 'line-through' : 'none'}
                    color={todo.completed ? 'gray.500' : 'inherit'}
                  >
                    {todo.text}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={todoStore.$.createRemoveTodo(todo.id)}
                  >
                    ×
                  </Button>
                </HStack>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>
    </SimpleGrid>
  );
};

export default TodoAppDemo;
