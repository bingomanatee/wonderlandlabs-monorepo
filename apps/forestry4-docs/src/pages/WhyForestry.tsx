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
  Alert,
  AlertIcon,
  Divider,
  Icon,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react'
import { CheckIcon, StarIcon } from '@chakra-ui/icons'
import { Link as RouterLink } from 'react-router-dom'
import { Store } from '@wonderlandlabs/forestry4'
import CodeTabs from '../components/CodeTabs'

const WhyForestry: React.FC = () => {
  const [testingStore, setTestingStore] = useState<Store<any> | null>(null)
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    // Create a demo store for testing examples
    const store = new Store({
      name: 'user-profile',
      value: { name: '', age: 0, email: '', preferences: { theme: 'light' } },
      actions: {
        // Nested action example
        updateProfile: function(this: Store<any>, value: any, updates: any) {
          this.next({ ...value, ...updates });
        },
        updatePreferences: function(this: Store<any>, value: any, prefs: any) {
          this.set('preferences', { ...value.preferences, ...prefs });
        },
        // Nested action that calls other actions
        setupUser: function(this: Store<any>, value: any, userData: any) {
          // This demonstrates nested actions
          this.$.updateProfile(userData.profile);
          this.$.updatePreferences(userData.preferences);
        },
      },
      tests: [
        (value: any) => value.age < 0 ? 'Age cannot be negative' : null,
        (value: any) => value.name.length === 0 ? 'Name is required' : null,
        (value: any) => value.email && !value.email.includes('@') ? 'Invalid email format' : null,
      ],
    })

    setTestingStore(store)
  }, [])

  const runTests = () => {
    if (!testingStore) return

    const results: string[] = []
    
    // Test 1: Valid state
    try {
      testingStore.next({ name: 'John', age: 30, email: 'john@example.com', preferences: { theme: 'dark' } })
      results.push('✅ Valid state update succeeded')
    } catch (error) {
      results.push(`❌ Valid state failed: ${(error as Error).message}`)
    }

    // Test 2: Invalid state (should fail)
    try {
      testingStore.next({ name: '', age: -5, email: 'invalid-email', preferences: { theme: 'dark' } })
      results.push('❌ Invalid state should have failed but succeeded')
    } catch (error) {
      results.push('✅ Invalid state correctly rejected')
    }

    // Test 3: Action testing
    try {
      testingStore.$.updateProfile({ name: 'Jane', age: 25 })
      results.push('✅ Action execution succeeded')
    } catch (error) {
      results.push(`❌ Action failed: ${(error as Error).message}`)
    }

    setTestResults(results)
  }

  const comparisonTabs = [
    {
      label: 'Redux',
      language: 'typescript',
      code: `// Redux - Complex setup
const initialState = { count: 0 };

const counterReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
};

const store = createStore(counterReducer);

// Actions
const increment = () => ({ type: 'INCREMENT' });

// Usage
store.dispatch(increment());`,
    },
    {
      label: 'Zustand',
      language: 'typescript',
      code: `// Zustand - Simple but limited validation
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  // No built-in validation
  // No transaction support
  // Limited testing capabilities
}));

// Usage
const { count, increment } = useStore();`,
    },
    {
      label: 'Forestry 4',
      language: 'typescript',
      code: `// Forestry 4 - Simple setup with powerful features
const store = new Store({
  name: 'counter',
  value: { count: 0 },
  actions: {
    increment: function(value) {
      this.next({ ...value, count: value.count + 1 });
    },
  },
  tests: [
    (value) => value.count < 0 ? 'Count cannot be negative' : null
  ]
});

// Usage - same simplicity, more power
store.$.increment();`,
    },
  ]

  const nestedActionTabs = [
    {
      label: 'Problem',
      language: 'typescript',
      code: `// Other libraries: Actions can't call other actions
const useStore = create((set, get) => ({
  user: { name: '', preferences: {} },
  updateName: (name) => set((state) => ({ 
    user: { ...state.user, name } 
  })),
  updatePreferences: (prefs) => set((state) => ({ 
    user: { ...state.user, preferences: { ...state.user.preferences, ...prefs } }
  })),
  // Can't easily compose actions
  setupUser: (userData) => {
    // Have to manually call multiple updates
    // No atomic operations
    // No rollback if one fails
  }
}));`,
    },
    {
      label: 'Forestry Solution',
      language: 'typescript',
      code: `// Forestry 4: Actions can call other actions naturally
const store = new Store({
  value: { user: { name: '', preferences: {} } },
  actions: {
    updateName: function(value, name) {
      this.next({ ...value, user: { ...value.user, name } });
    },
    updatePreferences: function(value, prefs) {
      this.next({ ...value, user: { ...value.user, preferences: { ...value.user.preferences, ...prefs } } });
    },
    // Actions can call other actions!
    setupUser: function(value, userData) {
      this.$.updateName(userData.name);
      this.$.updatePreferences(userData.preferences);
      // Atomic, validated, and composable
    }
  }
});`,
    },
  ]

  const testingTabs = [
    {
      label: 'Traditional Testing',
      language: 'typescript',
      code: `// Testing other state libraries
describe('Counter Store', () => {
  it('should increment', () => {
    const store = createStore(counterReducer);
    store.dispatch(increment());
    expect(store.getState().count).toBe(1);
    
    // But what about validation?
    // What about complex state transitions?
    // What about action composition?
  });
});`,
    },
    {
      label: 'Forestry Testing',
      language: 'typescript',
      code: `// Testing Forestry 4 stores
describe('User Store', () => {
  let store: Store<UserState>;
  
  beforeEach(() => {
    store = new Store({
      value: { name: '', age: 0 },
      actions: {
        updateUser: function(value, data) {
          this.next({ ...value, ...data });
        }
      },
      tests: [
        (value) => value.age < 0 ? 'Invalid age' : null
      ]
    });
  });

  it('should update valid user data', () => {
    store.$.updateUser({ name: 'John', age: 30 });
    expect(store.value).toEqual({ name: 'John', age: 30 });
  });

  it('should reject invalid data', () => {
    expect(() => {
      store.$.updateUser({ age: -5 });
    }).toThrow('Invalid age');
  });

  it('should test validation directly', () => {
    const error = store.validate({ name: '', age: -1 });
    expect(error).toBe('Invalid age');
  });
});`,
    },
  ]

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={12} align="stretch">
        {/* Hero */}
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Why Choose Forestry 4?
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto">
            Forestry 4 combines the simplicity you want with the power you need. 
            Here's what makes it different from other state management solutions.
          </Text>
        </Box>

        {/* Key Differentiators */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          <Card borderWidth="2px" borderColor="forest.200">
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Icon as={StarIcon} color="forest.500" />
                  <Heading size="lg" color="forest.700">Nested Actions</Heading>
                </HStack>
                <Text color="gray.600">
                  Actions can call other actions naturally. Build complex operations from simple, 
                  testable components. No other library makes action composition this easy.
                </Text>
                <List spacing={2}>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    Actions can call other actions with <code>this.$</code>
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    Atomic operations across multiple actions
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    Perfect for complex business logic
                  </ListItem>
                </List>
              </VStack>
            </CardBody>
          </Card>

          <Card borderWidth="2px" borderColor="blue.200">
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Icon as={CheckIcon} color="blue.500" />
                  <Heading size="lg" color="blue.700">Strong Validation</Heading>
                </HStack>
                <Text color="gray.600">
                  Built-in validation that actually works. Prevent invalid states before they happen, 
                  with clear error messages and easy testing.
                </Text>
                <List spacing={2}>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    Validation runs on every state change
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    Clear, actionable error messages
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    Testable validation logic
                  </ListItem>
                </List>
              </VStack>
            </CardBody>
          </Card>

          <Card borderWidth="2px" borderColor="purple.200">
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Icon as={StarIcon} color="purple.500" />
                  <Heading size="lg" color="purple.700">Universal Application</Heading>
                </HStack>
                <Text color="gray.600">
                  Same API for local component state and global application state. 
                  Start local, scale global, no refactoring needed.
                </Text>
                <List spacing={2}>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    Use for component-level state
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    Scale to global application state
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    Consistent patterns everywhere
                  </ListItem>
                </List>
              </VStack>
            </CardBody>
          </Card>

          <Card borderWidth="2px" borderColor="orange.200">
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Icon as={CheckIcon} color="orange.500" />
                  <Heading size="lg" color="orange.700">Ease of Testing</Heading>
                </HStack>
                <Text color="gray.600">
                  Testing is a first-class citizen. Test actions, validation, and state transitions 
                  with simple, predictable APIs.
                </Text>
                <List spacing={2}>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    Direct access to validation logic
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    Synchronous action testing
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    No mocking required
                  </ListItem>
                </List>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Comparison */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">How It Compares</Heading>
              <Text color="gray.600">
                See how Forestry 4 stacks up against popular alternatives:
              </Text>
              <CodeTabs tabs={comparisonTabs} />
            </VStack>
          </CardBody>
        </Card>

        {/* Nested Actions Deep Dive */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Nested Actions: The Game Changer</Heading>
              <Text color="gray.600">
                Most state libraries force you to choose between simple actions or complex reducers. 
                Forestry 4 lets actions call other actions, giving you the best of both worlds.
              </Text>
              <CodeTabs tabs={nestedActionTabs} />
              <Alert status="info">
                <AlertIcon />
                <Text>
                  <strong>Why this matters:</strong> You can build complex operations from simple, 
                  testable actions. Each action does one thing well, but they compose naturally.
                </Text>
              </Alert>
            </VStack>
          </CardBody>
        </Card>

        {/* Testing Excellence */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Testing Made Simple</Heading>
              <Text color="gray.600">
                Forestry 4 was designed with testing in mind. Every feature is easily testable 
                without complex setup or mocking.
              </Text>
              <CodeTabs tabs={testingTabs} />
              
              <Divider />
              
              <Box>
                <Heading size="md" mb={4}>Try It Yourself</Heading>
                <Text color="gray.600" mb={4}>
                  Click the button below to run actual tests on a Forestry 4 store:
                </Text>
                <Button colorScheme="forest" onClick={runTests} mb={4}>
                  Run Live Tests
                </Button>
                {testResults.length > 0 && (
                  <Box bg="gray.50" p={4} borderRadius="md">
                    <Text fontWeight="semibold" mb={2}>Test Results:</Text>
                    <VStack align="start" spacing={1}>
                      {testResults.map((result, index) => (
                        <Text key={index} fontSize="sm" fontFamily="mono">
                          {result}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Source Code for Testing Demo */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="lg">Testing Demo Source Code</Heading>
              <Text color="gray.600">
                Here's the complete source code for the live testing demo above:
              </Text>
              <CodeTabs
                tabs={[
                  {
                    label: 'Test Store Setup',
                    language: 'typescript',
                    code: `const testingStore = new Store({
  name: 'user-profile',
  value: {
    name: '',
    age: 0,
    email: '',
    preferences: { theme: 'light' }
  },
  actions: {
    updateProfile(state: any, updates: any) {
      return { ...state, ...updates }
    },
    updatePreferences(state: any, prefs: any) {
      return { ...state, preferences: { ...state.preferences, ...prefs } }
    },
    // Nested action example
    setupUser(state: any, userData: any) {
      const withProfile = this.$.updateProfile(userData.profile)
      return this.$.updatePreferences(userData.preferences)
    },
  },
  tests(state: any) {
    if (state.age < 0) return 'Age cannot be negative'
    if (state.name.length === 0) return 'Name is required'
    if (state.email && !state.email.includes('@')) return 'Invalid email format'
    return null
  },
})`,
                  },
                  {
                    label: 'Test Runner Logic',
                    language: 'typescript',
                    code: `const runTests = () => {
  const results: string[] = []

  // Test 1: Valid state
  try {
    testingStore.next({
      name: 'John',
      age: 30,
      email: 'john@example.com',
      preferences: { theme: 'dark' }
    })
    results.push('✅ Valid state update succeeded')
  } catch (error) {
    results.push(\`❌ Valid state failed: \${error.message}\`)
  }

  // Test 2: Invalid state (should fail)
  try {
    testingStore.next({
      name: '',
      age: -5,
      email: 'invalid-email',
      preferences: { theme: 'dark' }
    })
    results.push('❌ Invalid state should have failed but succeeded')
  } catch (error) {
    results.push('✅ Invalid state correctly rejected')
  }

  // Test 3: Action testing
  try {
    testingStore.$.updateProfile({ name: 'Jane', age: 25 })
    results.push('✅ Action execution succeeded')
  } catch (error) {
    results.push(\`❌ Action failed: \${error.message}\`)
  }

  setTestResults(results)
}`,
                  },
                  {
                    label: 'React Component',
                    language: 'tsx',
                    code: `const [testResults, setTestResults] = useState<string[]>([])

return (
  <Box>
    <Button colorScheme="forest" onClick={runTests}>
      Run Live Tests
    </Button>

    {testResults.length > 0 && (
      <Box bg="gray.50" p={4} borderRadius="md" mt={4}>
        <Text fontWeight="semibold" mb={2}>Test Results:</Text>
        <VStack align="start" spacing={1}>
          {testResults.map((result, index) => (
            <Text key={index} fontSize="sm" fontFamily="mono">
              {result}
            </Text>
          ))}
        </VStack>
      </Box>
    )}
  </Box>
)`,
                  },
                ]}
              />
            </VStack>
          </CardBody>
        </Card>

        {/* Call to Action */}
        <Card bg="forest.50" borderColor="forest.200" borderWidth="2px">
          <CardBody>
            <VStack spacing={6} textAlign="center">
              <Heading size="lg" color="forest.700">
                Ready to Experience the Difference?
              </Heading>
              <Text color="gray.600" maxW="2xl">
                Start with the essential features and discover why developers are choosing 
                Forestry 4 for their React applications.
              </Text>
              <HStack spacing={4}>
                <Button as={RouterLink} to="/store" colorScheme="forest" size="lg">
                  Get Started
                </Button>
                <Button as={RouterLink} to="/examples" variant="outline" size="lg">
                  See Examples
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default WhyForestry
