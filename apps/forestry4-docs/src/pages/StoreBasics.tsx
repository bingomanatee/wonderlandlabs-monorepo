import React, { useState } from 'react';
import {
  Container,
  Heading,
  Text,
  Box,
  SimpleGrid,
  Button,
  VStack,
  HStack,
  Input,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Badge,
  Image,
} from '@chakra-ui/react';
import CodeTabs from '../components/CodeTabs';
import CodeBlock from '../components/CodeBlock';
import { Link } from 'react-router-dom';
import useForestryLocal from '../hooks/useForestryLocal';
import userProfileFactory from '../storeFactories/userProfileFactory';
import Section from '../components/Section';

const constructorTabs = [
  {
    label: 'Basic Store',
    language: 'typescript',
    snippet: 'basicStore',
    folder: 'StoreBasics',
  },
  {
    label: 'With Validation',
    language: 'typescript',
    snippet: 'storeWithValidation',
    folder: 'StoreBasics',
  },
  {
    label: 'React Hook',
    language: 'tsx',
    snippet: 'reactHookPattern',
    folder: 'StoreBasics',
  },
];

const StoreBasics: React.FC = () => {
  const [userValue, store] = useForestryLocal(userProfileFactory);
  const [error, setError] = useState('');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={4}>
            Store Overview
          </Heading>
          <Text fontSize="lg" color="gray.600">
            The Store class is the core of Forestry 4, providing reactive state management with
            validation and transaction support.
          </Text>
        </Box>

        {/* Constructor Section */}
        <Section title="Store Constructor">
              <Text color="gray.600">
                Create a new Store instance with configuration options. They are all optional except
                for value
              </Text>

              <Box bg="gray.100" p={4} borderRadius="md" fontFamily="mono" fontSize="sm">
                new Store&lt;T&gt;(config: StoreConfig&lt;T&gt;)
              </Box>
              <Heading size="sm">Config properties</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box>
                  <Heading size="md" mb={3}>
                    name <Badge colorScheme="blue">string</Badge>
                  </Heading>
                  <Text color="gray.600" mb={3}>
                    Unique identifier for the store instance.
                  </Text>
                  <Box bg="gray.50" p={3} borderRadius="md" fontFamily="mono" fontSize="sm">
                    name: 'user-store'
                  </Box>
                </Box>

                <Box>
                  <Heading size="md" mb={3}>
                    value <Badge colorScheme="green">T</Badge>{' '}
                    <Badge colorScheme="red">Required</Badge>
                  </Heading>
                  <Text color="gray.600" mb={3}>
                    Initial state value for the store.
                  </Text>
                  <Box bg="gray.50" p={3} borderRadius="md" fontFamily="mono" fontSize="sm">
                    {`value: { 
  name: 'John', 
  age: 30 
}`}
                  </Box>
                </Box>

                <Box>
                  <Heading size="md" mb={3}>
                    actions <Badge colorScheme="purple">Record&lt;string, Function&gt;</Badge>
                  </Heading>
                  <Text color="gray.600" mb={3}>
                    Object containing action functions for state updates.
                  </Text>
                  <Box bg="gray.50" p={3} borderRadius="md" fontFamily="mono" fontSize="sm">
                    {`actions: {
  setName: (state, name) => ({ ...state, name })
}`}
                  </Box>
                </Box>

                <Box>
                  <Heading size="md" mb={3}>
                    tests <Badge colorScheme="orange">Function | Function[]</Badge>
                  </Heading>
                  <Text color="gray.600" mb={3}>
                    Validation function to ensure state integrity. expects candidateValue as first
                    argument - bound to store.
                  </Text>
                  <Box bg="gray.50" p={3} borderRadius="md" fontFamily="mono" fontSize="sm">
                    <CodeBlock language="typescript">{`tests: (candidateValue)  {
  if (candidateValue.age < 0) return 'Invalid age';
  return null; // Valid; 
  // you don't actually have to return ANYTHING for valid candidates
}`}</CodeBlock>
                  </Box>
                </Box>
              </SimpleGrid>
              <Text size="sm">
                See <Link to="/validation">Validation</Link> for more details on Vaidation
                parameters
              </Text>
        </Section>

        <Section>
          <Heading>The Forestry Lifecycle</Heading>
          <Image src="/flowchart.svg" width="full" mx={8} maxHeight="80vh" />
          <Text>
            The forestry state has a deep update cycle; understanding the nuances and order of how
            values are curated and validated is important to recognize why Forestry is more than a
            repackaged Redux or a RxJS decorator.
          </Text>
        </Section>

        {/* Code Examples */}
        <Section title="Code Examples">
              <CodeTabs tabs={constructorTabs} />
          
        </Section>

        {/* Live Example */}
        <Section title="Live Example">
              <Text color="gray.600">
                Try updating the user profile below to see validation in action:
              </Text>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                {/* Form */}
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Update Profile</Heading>

                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input name="name" value={userValue.name} onChange={store?.$.onChange} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Age</FormLabel>
                    <Input
                      name="age"
                      type="number"
                      value={userValue.age.toString()}
                      onChange={store?.$.onChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={userValue.email}
                      onChange={store?.$.onChange}
                    />
                  </FormControl>

                  <HStack>
                    <Button variant="outline" onClick={() => store?.$.reset()}>
                      Reset to Defaults
                    </Button>
                  </HStack>

                  {error && (
                    <Alert status="error">
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}
                </VStack>

                {/* Current State */}
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Current State</Heading>
                  <Box bg="gray.50" p={4} borderRadius="md">
                    <pre>{JSON.stringify(userValue, null, 2)}</pre>
                  </Box>

                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      Profile Stats:
                    </Text>
                    <VStack align="start" spacing={1} fontSize="sm">
                      <Text>
                        Name length: <Badge>{userValue.name.length}</Badge>
                      </Text>
                      <Text>
                        Valid email:{' '}
                        <Badge colorScheme={userValue.email.includes('@') ? 'green' : 'red'}>
                          {userValue.email.includes('@') ? 'Yes' : 'No'}
                        </Badge>
                      </Text>
                      <Text>
                        Age range:{' '}
                        <Badge
                          colorScheme={userValue.age >= 0 && userValue.age <= 150 ? 'green' : 'red'}
                        >
                          {userValue.age >= 0 && userValue.age <= 150 ? 'Valid' : 'Invalid'}
                        </Badge>
                      </Text>
                    </VStack>
                  </Box>
                </VStack>
              </SimpleGrid>
        </Section>

        {/* Update Patterns */}
        <Section title="Update Patterns">
              <Text color="gray.600">
                Forestry 4 provides different methods for updating store values efficiently:
              </Text>

              <CodeTabs
                tabs={[
                  {
                    label: 'Form onChange Handler',
                    language: 'typescript',
                    code: `// Tactical form handler using event target name
actions: {
  onChange: function(value, event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value: fieldValue, type } = event.target;
    const processedValue = type === 'number' ? parseInt(fieldValue) || 0 : fieldValue;
    this.set(name, processedValue);  // Uses field name to update correct property
  }
}

// Usage in JSX - actions are pre-bound, no wrapper needed:
<Input name="age" type="number" value={state.age} onChange={store.$.onChange} />
<Input name="email" value={state.email} onChange={store.$.onChange} />`,
                  },
                  {
                    label: 'Single Field Updates',
                    language: 'typescript',
                    code: `// Use set() for single field updates - most efficient
actions: {
  setName: function(value, name: string) {
    this.set('name', name);  // Updates only the name field
  },
  setAge: function(value, age: number) {
    this.set('age', age);    // Updates only the age field
  },
  // For nested paths
  setTheme: function(value, theme: string) {
    this.set('preferences.theme', theme);  // Deep path update
  }
}`,
                  },
                  {
                    label: 'Multiple Field Updates',
                    language: 'typescript',
                    code: `// Use next() for multiple field updates
actions: {
  updateProfile: function(value, updates: Partial<UserState>) {
    this.next({ ...value, ...updates });  // Merge multiple fields
  },
  reset: function() {
    this.next({  // Replace entire value
      name: 'John Doe',
      age: 30,
      email: 'john@example.com'
    });
  }
}`,
                  },
                  {
                    label: 'Complex Updates',
                    language: 'typescript',
                    code: `// Use mutate() for complex transformations
actions: {
  addTag: function(value, tag: string) {
    this.mutate(draft => {
      draft.tags.push(tag);  // Immer-powered mutations
    });
  },
  updateNestedSettings: function(value, settings: any) {
    this.mutate(draft => {
      Object.assign(draft.profile.settings, settings);
    }, 'profile');  // Mutate specific path
  }
}`,
                  },
                  {
                    label: 'Validation Patterns',
                    language: 'typescript',
                    code: `// Use arrays of test functions for clean validation
tests: [
  (value) => value.age < 0 ? 'Age cannot be negative' : null,
  (value) => value.age > 150 ? 'Age seems unrealistic' : null,
  (value) => !value.email.includes('@') ? 'Invalid email format' : null,
  (value) => value.name.length === 0 ? 'Name cannot be empty' : null,
]`,
                  },
                ]}
              />
        </Section>

        {/* Source Code for Live Example */}
        <Section title="Live Example Source Code">
              <Text color="gray.600">
                Here's the complete source code for the user profile demo above:
              </Text>
              <CodeTabs
                tabs={[
                  {
                    label: 'Store Definition',
                    language: 'typescript',
                    code: `const userStore = new Store<UserState>({
  name: 'user-store',
  value: {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
  },
  actions: {
    // Tactical form handler
    onChange: function(value: UserState, event: React.ChangeEvent<HTMLInputElement>) {
      const { name, value: fieldValue, type } = event.target;
      const processedValue = type === 'number' ? parseInt(fieldValue) || 0 : fieldValue;
      this.set(name, processedValue);
    },
    setName: function(value: UserState, name: string) {
      this.set('name', name);
    },
    setAge: function(value: UserState, age: number) {
      this.set('age', age);
    },
    setEmail: function(value: UserState, email: string) {
      this.set('email', email);
    },
    updateProfile: function(value: UserState, profile: Partial<UserState>) {
      this.next({ ...value, ...profile });
    },
    reset: function() {
      this.next({
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      });
    },
  },
  tests: [
    (value: UserState) => value.age < 0 ? 'Age cannot be negative' : null,
    (value: UserState) => value.age > 150 ? 'Age seems unrealistic' : null,
    (value: UserState) => !value.email.includes('@') ? 'Invalid email format' : null,
    (value: UserState) => value.name.length === 0 ? 'Name cannot be empty' : null,
  ],
})`,
                  },
                  {
                    label: 'React Integration',
                    language: 'tsx',
                    code: `const [userState, setUserState] = useState<UserState>({ name: '', age: 0, email: '' })
const [error, setError] = useState('')

useEffect(() => {
  const subscription = userStore.subscribe((state) => {
    setUserState(state)
    setError('')
  })

  return () => {
    subscription.unsubscribe()
  }
}, [])

// No separate form state needed - store handles everything!`,
                  },
                  {
                    label: 'Form Component',
                    language: 'tsx',
                    code: `<FormControl>
  <FormLabel>Name</FormLabel>
  <Input
    name="name"
    value={userState.name}
    onChange={store.$.onChange}
  />
</FormControl>

<FormControl>
  <FormLabel>Age</FormLabel>
  <Input
    name="age"
    type="number"
    value={userState.age.toString()}
    onChange={store.$.onChange}
  />
</FormControl>

<FormControl>
  <FormLabel>Email</FormLabel>
  <Input
    name="email"
    type="email"
    value={userState.email}
    onChange={store.$.onChange}
  />
</FormControl>

<Button variant="outline" onClick={() => store?.$.reset()}>
  Reset to Defaults
</Button>

{error && (
  <Alert status="error">
    <AlertIcon />
    {error}
  </Alert>
)}`,
                  },
                ]}
              />
        </Section>
      </VStack>
    </Container>
  );
};

export default StoreBasics;
