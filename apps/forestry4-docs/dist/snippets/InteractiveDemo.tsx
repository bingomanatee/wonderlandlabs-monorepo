// Auto-generated snippet from: apps/forestry4-docs/src/components/WhyForestry/InteractiveDemo.tsx
// Description: Interactive demo component showing Forestry in action
// Last synced: Thu Sep 18 21:57:37 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  Box,
  SimpleGrid,
} from '@chakra-ui/react';
import useForestryLocal from '../../hooks/useForestryLocal';
import demoStoreFactory from '../../storeFactories/demoStoreFactory';
import FormField from '../FormField';

const InteractiveDemo: React.FC = () => {
  return ''; // TEMPORARILY DISABLED FOR 4.1.3 MIGRATION
  const [state, store] = useForestryLocal(demoStoreFactory);
  const [testResults, setTestResults] = React.useState<string[]>([]);

  const runTests = () => {
    const results: string[] = [];

    // Test 1: Profile update with validation
    try {
      const testStore1 = demoStoreFactory();
      testStore1.$.updateProfile({ name: 'John Doe', age: 30 });
      
      // Check if validation passed (no errors)
      if (!testStore1.value.errors.name && !testStore1.value.errors.age) {
        results.push('✅ Profile update - validation passed');
      } else {
        results.push('❌ Profile update - validation failed');
      }
    } catch (error) {
      results.push('❌ Profile update - threw error');
    }

    // Test 2: Invalid age validation
    try {
      const testStore2 = demoStoreFactory();
      testStore2.$.handleInputChange({ target: { name: 'age', value: '200', type: 'number' } } as any);
      
      // Should have age error
      if (testStore2.value.errors.age) {
        results.push('✅ Age validation - correctly caught invalid age');
      } else {
        results.push('❌ Age validation - failed to catch invalid age');
      }
    } catch (error) {
      results.push('❌ Age validation - threw error');
    }

    // Test 3: Email validation
    try {
      const testStore3 = demoStoreFactory();
      testStore3.$.handleInputChange({ target: { name: 'email', value: 'invalid-email', type: 'text' } } as any);
      
      // Should have email error
      if (testStore3.value.errors.email) {
        results.push('✅ Email validation - correctly caught invalid email');
      } else {
        results.push('❌ Email validation - failed to catch invalid email');
      }
    } catch (error) {
      results.push('❌ Email validation - threw error');
    }

    // Test 4: validateAndSave action
    try {
      const testStore4 = demoStoreFactory();
      testStore4.$.updateProfile({ name: 'Valid User', age: 25, email: 'user@example.com' });
      const result = testStore4.$.validateAndSave();
      
      if (result === 'Profile saved successfully!') {
        results.push('✅ validateAndSave - success case');
      } else {
        results.push('❌ validateAndSave - unexpected result');
      }
    } catch (error) {
      results.push('❌ validateAndSave - threw error');
    }

    setTestResults(results);
  };

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
      {/* Interactive Demo */}
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">Interactive Demo</Text>

        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <FormField
              name="name"
              label="Name"
              value={state.name}
              error={state.errors.name}
              onChange={store.$.handleInputChange}
              placeholder="Enter name"
            />

            <FormField
              name="age"
              label="Age"
              type="number"
              value={state.age || ''}
              error={state.errors.age}
              onChange={store.$.handleInputChange}
              placeholder="Enter age"
            />
          </HStack>

          <FormField
            name="email"
            label="Email"
            type="email"
            value={state.email}
            error={state.errors.email}
            onChange={store.$.handleInputChange}
            placeholder="Enter email"
          />

          <FormField
            name="theme"
            label="Theme"
            type="select"
            value={state.preferences.theme}
            onChange={store.$.handleThemeChange}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </VStack>

        <HStack spacing={4}>
          <Button 
            colorScheme="blue" 
            onClick={() => store.$.validateAndSave()}
            size="sm"
          >
            Save Profile
          </Button>
          <Button 
            colorScheme="green" 
            onClick={runTests}
            size="sm"
          >
            Run Tests
          </Button>
        </HStack>

        {testResults.length > 0 && (
          <Box>
            <Text fontWeight="bold" mb={2}>Test Results:</Text>
            <VStack spacing={1} align="stretch">
              {testResults.map((result, index) => (
                <Text key={index} fontSize="sm" fontFamily="mono">
                  {result}
                </Text>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>

      {/* Current State Display */}
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">Current State</Text>
        
        <Box bg="gray.50" p={4} borderRadius="md" fontSize="sm" fontFamily="mono">
          <Text fontWeight="bold" mb={2}>Store Value:</Text>
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </Box>

        <Alert status="info" size="sm">
          <AlertIcon />
          <Box>
            <Text fontSize="sm">
              This demo shows real-time Forestry state management with validation, 
              universal input handlers, and reactive updates.
            </Text>
          </Box>
        </Alert>
      </VStack>
    </SimpleGrid>
  );
};

export default InteractiveDemo;
