import React, { useState } from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import useForestryLocal from '../../hooks/useForestryLocal';
import userProfileFactory from '../../storeFactories/userProfileFactory';

const UserProfileDemo: React.FC = () => {
  const [userValue, store] = useForestryLocal(userProfileFactory);
  const [error, setError] = useState('');

  return (
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
          <Input name="email" type="email" value={userValue.email} onChange={store?.$.onChange} />
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
              <Badge colorScheme={userValue.age >= 0 && userValue.age <= 150 ? 'green' : 'red'}>
                {userValue.age >= 0 && userValue.age <= 150 ? 'Valid' : 'Invalid'}
              </Badge>
            </Text>
          </VStack>
        </Box>
      </VStack>
    </SimpleGrid>
  );
};

export default UserProfileDemo;
