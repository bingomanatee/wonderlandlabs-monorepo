import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Store } from '@wonderlandlabs/forestry4';

interface UserState {
  name: string;
  age: number;
  email: string;
}

const UserProfileDemo: React.FC = () => {
  const [userState, setUserState] = useState<UserState>({ name: '', age: 0, email: '' });
  const [error, setError] = useState('');
  const [store, setStore] = useState<Store<UserState> | null>(null);

  useEffect(() => {
    const userStore = new Store<UserState>({
      name: 'user-store',
      value: {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      },
      actions: {
        // Tactical form handler using event target name
        onChange: function (
          this: Store<UserState>,
          value: UserState,
          event: React.ChangeEvent<HTMLInputElement>
        ) {
          const { name, value: fieldValue, type } = event.target;
          const processedValue = type === 'number' ? parseInt(fieldValue) || 0 : fieldValue;
          this.set(name, processedValue);
        },
        setName: function (this: Store<UserState>, value: UserState, name: string) {
          this.set('name', name);
        },
        setAge: function (this: Store<UserState>, value: UserState, age: number) {
          this.set('age', age);
        },
        setEmail: function (this: Store<UserState>, value: UserState, email: string) {
          this.set('email', email);
        },
        updateProfile: function (
          this: Store<UserState>,
          value: UserState,
          profile: Partial<UserState>
        ) {
          this.next({ ...value, ...profile });
        },
        reset: function (this: Store<UserState>) {
          this.next({
            name: 'John Doe',
            age: 30,
            email: 'john@example.com',
          });
        },
      },
      tests: [
        (value: UserState) => (value.age < 0 ? 'Age cannot be negative' : null),
        (value: UserState) => (value.age > 150 ? 'Age seems unrealistic' : null),
        (value: UserState) => (!value.email.includes('@') ? 'Invalid email format' : null),
        (value: UserState) => (value.name.length === 0 ? 'Name cannot be empty' : null),
      ],
    });

    const subscription = userStore.subscribe((state) => {
      setUserState(state);
      setError('');
    });

    // Handle validation errors
    userStore.observeTransStack().subscribe((stack) => {
      const lastTransaction = stack[stack.length - 1];
      if (lastTransaction?.error) {
        setError(lastTransaction.error.message);
      }
    });

    setStore(userStore);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAction = (action: () => void) => {
    try {
      setError('');
      action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input
            name="name"
            value={userState.name}
            onChange={store?.$.onChange}
            placeholder="Enter your name"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Age</FormLabel>
          <Input
            name="age"
            type="number"
            value={userState.age}
            onChange={store?.$.onChange}
            placeholder="Enter your age"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            type="email"
            value={userState.email}
            onChange={store?.$.onChange}
            placeholder="Enter your email"
          />
        </FormControl>

        <HStack>
          <Button
            colorScheme="forest"
            onClick={() =>
              handleAction(() =>
                store?.$.updateProfile({
                  name: 'Jane Smith',
                  age: 25,
                  email: 'jane@example.com',
                })
              )
            }
          >
            Load Jane's Profile
          </Button>
          <Button variant="outline" onClick={() => handleAction(() => store?.$.reset())}>
            Reset to John
          </Button>
        </HStack>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
      </VStack>

      <VStack spacing={4} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            Current State:
          </Text>
          <Box p={4} bg="gray.50" borderRadius="md" fontFamily="mono" fontSize="sm">
            <Text>
              <strong>Name:</strong> "{userState.name}"
            </Text>
            <Text>
              <strong>Age:</strong> {userState.age}
            </Text>
            <Text>
              <strong>Email:</strong> "{userState.email}"
            </Text>
          </Box>
        </Box>

        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            Validation Status:
          </Text>
          <VStack spacing={2} align="stretch">
            <HStack>
              <Text>Name:</Text>
              <Badge colorScheme={userState.name.length > 0 ? 'green' : 'red'}>
                {userState.name.length > 0 ? 'Valid' : 'Invalid'}
              </Badge>
            </HStack>
            <HStack>
              <Text>Age:</Text>
              <Badge colorScheme={userState.age >= 0 && userState.age <= 150 ? 'green' : 'red'}>
                {userState.age >= 0 && userState.age <= 150 ? 'Valid' : 'Invalid'}
              </Badge>
            </HStack>
            <HStack>
              <Text>Email:</Text>
              <Badge colorScheme={userState.email.includes('@') ? 'green' : 'red'}>
                {userState.email.includes('@') ? 'Valid' : 'Invalid'}
              </Badge>
            </HStack>
          </VStack>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.600">
            <strong>Try:</strong> Enter invalid values (negative age, empty name, invalid email) to
            see validation errors in action.
          </Text>
        </Box>
      </VStack>
    </SimpleGrid>
  );
};

export default UserProfileDemo;
