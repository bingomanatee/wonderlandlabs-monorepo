import React, { useState, useEffect, useMemo } from 'react'
import {
  Container,
  Heading,
  Text,
  Box,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  VStack,
  HStack,
  Input,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Divider,
  Code,
  Checkbox,
} from '@chakra-ui/react'
import { Store } from '@wonderlandlabs/forestry4'
import CodeTabs from '../components/CodeTabs'

interface TodoItem {
  id: number
  text: string
  completed: boolean
}

interface TodoState {
  todos: TodoItem[]
  filter: 'all' | 'active' | 'completed'
  newTodoText: string
}

const ReactIntegration: React.FC = () => {
  const [todoState, setTodoState] = useState<TodoState>({
    todos: [],
    filter: 'all',
    newTodoText: ''
  })

  // Create store with useMemo to prevent recreation
  const todoStore = useMemo(() => new Store<TodoState>({
    name: 'todo-app',
    value: {
      todos: [
        { id: 1, text: 'Learn Forestry 4', completed: true },
        { id: 2, text: 'Build React app', completed: false },
        { id: 3, text: 'Write documentation', completed: false },
      ],
      filter: 'all',
      newTodoText: ''
    },
    actions: {
      // Form handling with onChange
      onChange: function(value: TodoState, event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value: fieldValue } = event.target;
        this.set(name, fieldValue);
      },

      // Add new todo
      addTodo: function(value: TodoState) {
        if (!value.newTodoText.trim()) return;

        const newTodo: TodoItem = {
          id: Date.now(),
          text: value.newTodoText.trim(),
          completed: false
        };

        this.next({
          ...value,
          todos: [...value.todos, newTodo],
          newTodoText: ''
        });
      },

      // Toggle todo completion
      toggleTodo: function(value: TodoState, id: number) {
        const updatedTodos = value.todos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.set('todos', updatedTodos);
      },

      // Remove todo
      removeTodo: function(value: TodoState, id: number) {
        const filteredTodos = value.todos.filter(todo => todo.id !== id);
        this.set('todos', filteredTodos);
      },

      // Set filter
      setFilter: function(value: TodoState, filter: 'all' | 'active' | 'completed') {
        this.set('filter', filter);
      },

      // Clear completed todos
      clearCompleted: function(value: TodoState) {
        const activeTodos = value.todos.filter(todo => !todo.completed);
        this.set('todos', activeTodos);
      },
    },
    tests: [
      (value: TodoState) => value.newTodoText.length > 100 ? 'Todo text too long' : null,
    ]
  }), [])

  useEffect(() => {
    const subscription = todoStore.subscribe((state) => {
      setTodoState(state)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [todoStore])

  // Computed values (derived state)
  const filteredTodos = useMemo(() => {
    switch (todoState.filter) {
      case 'active':
        return todoState.todos.filter(todo => !todo.completed)
      case 'completed':
        return todoState.todos.filter(todo => todo.completed)
      default:
        return todoState.todos
    }
  }, [todoState.todos, todoState.filter])

  const completedCount = todoState.todos.filter(todo => todo.completed).length
  const activeCount = todoState.todos.length - completedCount

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={4}>
            React Integration
            <Badge ml={3} colorScheme="forest">Essential</Badge>
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Learn how to integrate Forestry 4 stores with React components and hooks.
          </Text>
        </Box>

        {/* Integration Patterns */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Integration Patterns</Heading>
              <Text color="gray.600">
                Forestry 4 integrates seamlessly with React using standard hooks and patterns.
              </Text>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Box>
                  <Heading size="md" mb={3}>Store Creation</Heading>
                  <Text color="gray.600" mb={4}>
                    Use <Code>useMemo</Code> to create stores once and prevent recreation on re-renders.
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md" fontFamily="mono" fontSize="sm">
                    <Text>const store = useMemo(() ={'>'} new Store({'{'})</Text>
                    <Text ml={4}>value: initialState,</Text>
                    <Text ml={4}>actions: {'{'}...{'}'},</Text>
                    <Text ml={4}>tests: [...]</Text>
                    <Text>{'}'}, []))</Text>
                  </Box>
                </Box>

                <Box>
                  <Heading size="md" mb={3}>State Subscription</Heading>
                  <Text color="gray.600" mb={4}>
                    Use <Code>useEffect</Code> to subscribe to store changes and update React state.
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md" fontFamily="mono" fontSize="sm">
                    <Text>useEffect(() ={'>'} {'{'}</Text>
                    <Text ml={4}>const sub = store.subscribe(setState);</Text>
                    <Text ml={4}>return () ={'>'} sub.unsubscribe();</Text>
                    <Text>{'}'}, [store])</Text>
                  </Box>
                </Box>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
        {/* Live Todo Demo */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Live Todo App Demo</Heading>
              <Text color="gray.600">
                A complete todo app showing React + Forestry 4 integration patterns:
              </Text>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Heading size="md" mb={4}>Add New Todo</Heading>
                    <HStack>
                      <Input
                        name="newTodoText"
                        placeholder="What needs to be done?"
                        value={todoState.newTodoText}
                        onChange={todoStore.$.onChange}
                        onKeyPress={(e) => e.key === 'Enter' && todoStore.$.addTodo()}
                      />
                      <Button
                        colorScheme="forest"
                        onClick={() => todoStore.$.addTodo()}
                        isDisabled={!todoState.newTodoText.trim()}
                      >
                        Add
                      </Button>
                    </HStack>
                  </Box>

                  <Box>
                    <Heading size="md" mb={4}>Filter Todos</Heading>
                    <HStack>
                      <Button
                        size="sm"
                        variant={todoState.filter === 'all' ? 'solid' : 'outline'}
                        colorScheme="forest"
                        onClick={() => todoStore.$.setFilter('all')}
                      >
                        All ({todoState.todos.length})
                      </Button>
                      <Button
                        size="sm"
                        variant={todoState.filter === 'active' ? 'solid' : 'outline'}
                        colorScheme="forest"
                        onClick={() => todoStore.$.setFilter('active')}
                      >
                        Active ({activeCount})
                      </Button>
                      <Button
                        size="sm"
                        variant={todoState.filter === 'completed' ? 'solid' : 'outline'}
                        colorScheme="forest"
                        onClick={() => todoStore.$.setFilter('completed')}
                      >
                        Completed ({completedCount})
                      </Button>
                    </HStack>
                  </Box>

                  {completedCount > 0 && (
                    <Box>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => todoStore.$.clearCompleted()}
                      >
                        Clear Completed ({completedCount})
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
                        {todoState.filter === 'all' ? 'No todos yet!' :
                         todoState.filter === 'active' ? 'No active todos!' :
                         'No completed todos!'}
                      </Text>
                    ) : (
                      <VStack spacing={3} align="stretch">
                        {filteredTodos.map((todo) => (
                          <HStack key={todo.id} p={3} bg="gray.50" borderRadius="md">
                            <Checkbox
                              isChecked={todo.completed}
                              onChange={() => todoStore.$.toggleTodo(todo.id)}
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
                              onClick={() => todoStore.$.removeTodo(todo.id)}
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
            </VStack>
          </CardBody>
        </Card>

        {/* Hook Patterns */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">React Hook Patterns</Heading>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Box>
                  <Heading size="md" mb={3}>Custom Hook Pattern</Heading>
                  <Text color="gray.600" mb={4}>
                    Create reusable hooks for common store patterns.
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md" fontFamily="mono" fontSize="sm">
                    <Text>function useStore{'<T>'}(store: Store{'<T>'}) {'{'}</Text>
                    <Text ml={4}>const [state, setState] = useState(store.value);</Text>
                    <Text ml={4}>useEffect(() ={'>'} {'{'}</Text>
                    <Text ml={8}>const sub = store.subscribe(setState);</Text>
                    <Text ml={8}>return () ={'>'} sub.unsubscribe();</Text>
                    <Text ml={4}>{'}'}, [store]);</Text>
                    <Text ml={4}>return [state, store.$] as const;</Text>
                    <Text>{'}'}</Text>
                  </Box>
                </Box>

                <Box>
                  <Heading size="md" mb={3}>Conditional Effects</Heading>
                  <Text color="gray.600" mb={4}>
                    Use effects that depend on specific store values.
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md" fontFamily="mono" fontSize="sm">
                    <Text>useEffect(() ={'>'} {'{'}</Text>
                    <Text ml={4}>if (todoState.todos.length === 0) {'{'}</Text>
                    <Text ml={8}>console.log('All todos completed!');</Text>
                    <Text ml={4}>{'}'}</Text>
                    <Text>{'}'}, [todoState.todos.length]);</Text>
                  </Box>
                </Box>

                <Box>
                  <Heading size="md" mb={3}>Derived State with useMemo</Heading>
                  <Text color="gray.600" mb={4}>
                    Compute expensive derived values only when dependencies change.
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md" fontFamily="mono" fontSize="sm">
                    <Text>const filteredTodos = useMemo(() ={'>'} {'{'}</Text>
                    <Text ml={4}>return todos.filter(filterFunction);</Text>
                    <Text>{'}'}, [todos, filter]);</Text>
                  </Box>
                </Box>

                <Box>
                  <Heading size="md" mb={3}>Event Handler Binding</Heading>
                  <Text color="gray.600" mb={4}>
                    Actions are pre-bound, no need for wrapper functions.
                  </Text>
                  <Box bg="gray.50" p={4} borderRadius="md" fontFamily="mono" fontSize="sm">
                    <Text>// ✅ Direct binding</Text>
                    <Text>{'<Button onClick={store.$.addTodo}>'}</Text>
                    <Text></Text>
                    <Text>// ❌ Unnecessary wrapper</Text>
                    <Text>{'<Button onClick={() => store.$.addTodo()}>'}</Text>
                  </Box>
                </Box>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Source Code */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Complete Source Code</Heading>
              <Text color="gray.600">
                Here's the complete implementation of the todo app above:
              </Text>

              <CodeTabs
                tabs={[
                  {
                    label: 'Store Setup',
                    language: 'typescript',
                    code: `const todoStore = useMemo(() => new Store<TodoState>({
  name: 'todo-app',
  value: {
    todos: [
      { id: 1, text: 'Learn Forestry 4', completed: true },
      { id: 2, text: 'Build React app', completed: false },
    ],
    filter: 'all',
    newTodoText: ''
  },
  actions: {
    // Form handling with onChange
    onChange: function(value: TodoState, event: React.ChangeEvent<HTMLInputElement>) {
      const { name, value: fieldValue } = event.target;
      this.set(name, fieldValue);
    },

    // Add new todo
    addTodo: function(value: TodoState) {
      if (!value.newTodoText.trim()) return;

      const newTodo: TodoItem = {
        id: Date.now(),
        text: value.newTodoText.trim(),
        completed: false
      };

      this.next({
        ...value,
        todos: [...value.todos, newTodo],
        newTodoText: ''
      });
    },

    // Toggle todo completion
    toggleTodo: function(value: TodoState, id: number) {
      const updatedTodos = value.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      this.set('todos', updatedTodos);
    },

    // Remove todo
    removeTodo: function(value: TodoState, id: number) {
      const filteredTodos = value.todos.filter(todo => todo.id !== id);
      this.set('todos', filteredTodos);
    },

    // Set filter
    setFilter: function(value: TodoState, filter: 'all' | 'active' | 'completed') {
      this.set('filter', filter);
    },
  },
  tests: [
    (value: TodoState) => value.newTodoText.length > 100 ? 'Todo text too long' : null,
  ]
}), [])`,
                  },
                  {
                    label: 'React Integration',
                    language: 'tsx',
                    code: `const [todoState, setTodoState] = useState<TodoState>({
  todos: [], filter: 'all', newTodoText: ''
});

useEffect(() => {
  const subscription = todoStore.subscribe((state) => {
    setTodoState(state);
  });

  return () => {
    subscription.unsubscribe();
  };
}, [todoStore]);

// Computed values (derived state)
const filteredTodos = useMemo(() => {
  switch (todoState.filter) {
    case 'active':
      return todoState.todos.filter(todo => !todo.completed);
    case 'completed':
      return todoState.todos.filter(todo => todo.completed);
    default:
      return todoState.todos;
  }
}, [todoState.todos, todoState.filter]);

const completedCount = todoState.todos.filter(todo => todo.completed).length;
const activeCount = todoState.todos.length - completedCount;`,
                  },
                  {
                    label: 'JSX Components',
                    language: 'tsx',
                    code: `{/* Add Todo Form */}
<HStack>
  <Input
    name="newTodoText"
    placeholder="What needs to be done?"
    value={todoState.newTodoText}
    onChange={todoStore.$.onChange}
    onKeyPress={(e) => e.key === 'Enter' && todoStore.$.addTodo()}
  />
  <Button
    colorScheme="forest"
    onClick={todoStore.$.addTodo}
    isDisabled={!todoState.newTodoText.trim()}
  >
    Add
  </Button>
</HStack>

{/* Filter Buttons */}
<HStack>
  <Button
    variant={todoState.filter === 'all' ? 'solid' : 'outline'}
    onClick={() => todoStore.$.setFilter('all')}
  >
    All ({todoState.todos.length})
  </Button>
  <Button
    variant={todoState.filter === 'active' ? 'solid' : 'outline'}
    onClick={() => todoStore.$.setFilter('active')}
  >
    Active ({activeCount})
  </Button>
</HStack>

{/* Todo Items */}
{filteredTodos.map((todo) => (
  <HStack key={todo.id}>
    <Checkbox
      isChecked={todo.completed}
      onChange={() => todoStore.$.toggleTodo(todo.id)}
    />
    <Text>{todo.text}</Text>
    <Button onClick={() => todoStore.$.removeTodo(todo.id)}>
      Remove
    </Button>
  </HStack>
))}`,
                  },
                  {
                    label: 'Custom Hook',
                    language: 'typescript',
                    code: `// Reusable hook for any Forestry 4 store
function useStore<T>(store: Store<T>) {
  const [state, setState] = useState<T>(store.value);

  useEffect(() => {
    const subscription = store.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [store]);

  return [state, store.$] as const;
}

// Usage in component
const TodoApp: React.FC = () => {
  const todoStore = useMemo(() => new Store({ /* ... */ }), []);
  const [todoState, actions] = useStore(todoStore);

  return (
    <div>
      <Input
        value={todoState.newTodoText}
        onChange={actions.onChange}
      />
      <Button onClick={actions.addTodo}>Add</Button>
    </div>
  );
};`,
                  },
                ]}
              />
            </VStack>
          </CardBody>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">React Integration Best Practices</Heading>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Box>
                  <Heading size="md" mb={3} color="green.600">✅ Do</Heading>
                  <VStack spacing={3} align="stretch">
                    <Box p={3} bg="green.50" borderRadius="md">
                      <Text fontWeight="semibold">Use useMemo for store creation</Text>
                      <Text fontSize="sm" color="gray.600">
                        Prevents store recreation on re-renders
                      </Text>
                    </Box>
                    <Box p={3} bg="green.50" borderRadius="md">
                      <Text fontWeight="semibold">Subscribe in useEffect</Text>
                      <Text fontSize="sm" color="gray.600">
                        Clean up subscriptions in the return function
                      </Text>
                    </Box>
                    <Box p={3} bg="green.50" borderRadius="md">
                      <Text fontWeight="semibold">Use direct action binding</Text>
                      <Text fontSize="sm" color="gray.600">
                        <Code>onClick={`{store.$.action}`}</Code> not <Code>onClick={`{() => store.$.action()}`}</Code>
                      </Text>
                    </Box>
                    <Box p={3} bg="green.50" borderRadius="md">
                      <Text fontWeight="semibold">Compute derived state with useMemo</Text>
                      <Text fontSize="sm" color="gray.600">
                        Optimize expensive calculations
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                <Box>
                  <Heading size="md" mb={3} color="red.600">❌ Don't</Heading>
                  <VStack spacing={3} align="stretch">
                    <Box p={3} bg="red.50" borderRadius="md">
                      <Text fontWeight="semibold">Create stores in render</Text>
                      <Text fontSize="sm" color="gray.600">
                        Use useMemo or create outside component
                      </Text>
                    </Box>
                    <Box p={3} bg="red.50" borderRadius="md">
                      <Text fontWeight="semibold">Forget to unsubscribe</Text>
                      <Text fontSize="sm" color="gray.600">
                        Always return cleanup function from useEffect
                      </Text>
                    </Box>
                    <Box p={3} bg="red.50" borderRadius="md">
                      <Text fontWeight="semibold">Wrap actions unnecessarily</Text>
                      <Text fontSize="sm" color="gray.600">
                        Actions are pre-bound, use them directly
                      </Text>
                    </Box>
                    <Box p={3} bg="red.50" borderRadius="md">
                      <Text fontWeight="semibold">Put complex logic in components</Text>
                      <Text fontSize="sm" color="gray.600">
                        Keep business logic in store actions
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default ReactIntegration
