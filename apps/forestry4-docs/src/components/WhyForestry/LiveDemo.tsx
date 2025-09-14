import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Alert,
  AlertIcon,
  Input,
  FormControl,
  FormLabel,
  Select,
  Divider
} from '@chakra-ui/react';
import useForestryLocal from '../../hooks/useForestryLocal';
import demoStoreFactory, { type UserProfile } from '../../storeFactories/demoStoreFactory';

const LiveDemo: React.FC = () => {
  const [state, store] = useForestryLocal(demoStoreFactory);
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = () => {
    const results: string[] = [];

    // Each test uses a fresh store - proper testing pattern
    results.push(demoStoreFactory().tap(s => s.$.updateProfile({ name: 'John Doe', age: 30 })) ? '✅ Profile update' : '❌ Profile failed');
    results.push(demoStoreFactory().tap(s => s.$.updatePreferences({ theme: 'dark' })) ? '✅ Preferences update' : '❌ Preferences failed');
    results.push(demoStoreFactory().tap(s => s.$.setupUser({
      profile: { name: 'Jane Smith', email: 'jane@example.com' },
      preferences: { theme: 'light' }
    })) ? '✅ Nested action' : '❌ Nested failed');

    setTestResults(results);
  };

  const resetDemo = () => {
    store.$.updateProfile({ name: '', age: 0, email: '' });
    store.$.updatePreferences({ theme: 'light' });
    setTestResults([]);
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Interactive Form */}
        <Box layerStyle="card" bg="blue.50">
          <Text fontSize="lg" fontWeight="bold" mb={4}>Interactive Demo</Text>
          
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={state.name}
                  onChange={(e) => store.$.updateProfile({ name: e.target.value })}
                  placeholder="Enter name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Age</FormLabel>
                <Input
                  type="number"
                  value={state.age || ''}
                  onChange={(e) => {
                    try {
                      store.$.setAge(parseInt(e.target.value) || 0);
                    } catch (error) {
                      console.error('Age validation error:', error);
                    }
                  }}
                  placeholder="Enter age"
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                value={state.email}
                onChange={(e) => store.$.updateProfile({ email: e.target.value })}
                placeholder="Enter email"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Theme</FormLabel>
              <Select
                value={state.preferences.theme}
                onChange={(e) => store.$.updatePreferences({ theme: e.target.value as 'light' | 'dark' })}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </FormControl>
          </VStack>
        </Box>

        {/* Current State Display */}
        <Box layerStyle="card" bg="green.50">
          <Text fontSize="lg" fontWeight="bold" mb={4}>Current State</Text>
          <Box as="pre" fontSize="sm" fontFamily="mono" bg="white" p={3} borderRadius="md">
            {JSON.stringify(state, null, 2)}
          </Box>
        </Box>

        {/* Test Controls */}
        <HStack spacing={4}>
          <Button colorScheme="blue" onClick={runTests}>
            Run Live Tests
          </Button>
          <Button variant="outline" onClick={resetDemo}>
            Reset Demo
          </Button>
        </HStack>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Box layerStyle="card" bg="gray.50">
            <Text fontSize="lg" fontWeight="bold" mb={4}>Test Results</Text>
            <VStack spacing={2} align="stretch">
              {testResults.map((result, index) => (
                <Box key={index}>
                  <Badge
                    colorScheme={result.startsWith('✅') ? 'green' : 'red'}
                    mr={2}
                  >
                    {result.startsWith('✅') ? 'PASS' : 'FAIL'}
                  </Badge>
                  <Text as="span" fontSize="sm">
                    {result.substring(2)}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        <Alert status="info">
          <AlertIcon />
          <Box>
            <Text fontWeight="semibold">Live Forestry Store in Action</Text>
            <Text fontSize="sm" mt={1}>
              This demo uses useForestryLocal hook for reactive updates. 
              Try changing values above and running tests to see Forestry's capabilities.
            </Text>
          </Box>
        </Alert>
      </VStack>
    </Box>
  );
};

export default LiveDemo;
