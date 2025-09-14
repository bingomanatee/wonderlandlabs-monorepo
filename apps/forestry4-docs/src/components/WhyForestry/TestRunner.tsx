import React from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Code
} from '@chakra-ui/react';
import useForestryLocal from '../../hooks/useForestryLocal';
import demoStoreFactory from '../../storeFactories/demoStoreFactory';

const TestRunner: React.FC = () => {
  const [testResults, setTestResults] = useForestryLocal(() => 
    demoStoreFactory({ 
      value: { results: [] as string[] },
      actions: {
        addResult: function(value, result: string) {
          this.mutate(draft => {
            draft.results.push(result);
          });
        },
        clearResults: function() {
          this.next({ results: [] });
        }
      }
    })
  );

  const runTests = () => {
    const [, testStore] = testResults;
    testStore.$.clearResults();

    // Test 1: Basic profile update with fresh store
    try {
      const store1 = demoStoreFactory();
      store1.$.updateProfile({ name: 'John Doe', age: 30 });
      testStore.$.addResult('✅ Test 1: Profile update successful');
    } catch (error) {
      testStore.$.addResult(`❌ Test 1: Profile update failed: ${error}`);
    }

    // Test 2: Preferences update with fresh store
    try {
      const store2 = demoStoreFactory();
      store2.$.updatePreferences({ theme: 'dark' });
      testStore.$.addResult('✅ Test 2: Preferences update successful');
    } catch (error) {
      testStore.$.addResult(`❌ Test 2: Preferences update failed: ${error}`);
    }

    // Test 3: Nested action with fresh store
    try {
      const store3 = demoStoreFactory();
      store3.$.setupUser({
        profile: { name: 'Jane Smith', email: 'jane@example.com' },
        preferences: { theme: 'light' }
      });
      testStore.$.addResult('✅ Test 3: Nested action successful');
    } catch (error) {
      testStore.$.addResult(`❌ Test 3: Nested action failed: ${error}`);
    }

    // Test 4: Validation with fresh store
    try {
      const store4 = demoStoreFactory();
      store4.$.updateProfile({ name: '', age: -5 }); // Should trigger validation
      testStore.$.addResult('❌ Test 4: Validation should have failed');
    } catch (error) {
      testStore.$.addResult('✅ Test 4: Validation correctly prevented invalid data');
    }

    // Test 5: State isolation test
    try {
      const storeA = demoStoreFactory();
      const storeB = demoStoreFactory();
      
      storeA.$.updateProfile({ name: 'Alice' });
      storeB.$.updateProfile({ name: 'Bob' });
      
      if (storeA.value.profile.name === 'Alice' && storeB.value.profile.name === 'Bob') {
        testStore.$.addResult('✅ Test 5: Store isolation working correctly');
      } else {
        testStore.$.addResult('❌ Test 5: Store isolation failed');
      }
    } catch (error) {
      testStore.$.addResult(`❌ Test 5: Store isolation test failed: ${error}`);
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Button onClick={runTests} colorScheme="blue" size="sm">
          Run Forestry Tests
        </Button>
        
        {testResults[0].results.length > 0 && (
          <Box>
            <Text fontWeight="bold" mb={2}>Test Results:</Text>
            <VStack spacing={2} align="stretch">
              {testResults[0].results.map((result, index) => (
                <Alert
                  key={index}
                  status={result.startsWith('✅') ? 'success' : 'error'}
                  size="sm"
                >
                  <AlertIcon />
                  <Code fontSize="sm">{result}</Code>
                </Alert>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default TestRunner;
