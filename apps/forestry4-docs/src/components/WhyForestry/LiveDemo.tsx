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
  Divider,
  SimpleGrid,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import CodeBlock from '../CodeBlock';
import SnippetBlock from '../SnippetBlock';
import InteractiveDemo from './InteractiveDemo';

const LiveDemo: React.FC = () => {

  return (
    <Box layerStyle="card" bg="blue.50">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Try Forestry Live
          </Heading>
          <Text color="gray.600">
            Interact with a real Forestry store. See the source code and try the live demo side by side.
          </Text>
        </Box>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Live Demo</Tab>
            <Tab>Store Factory</Tab>
            <Tab>Component Code</Tab>
            <Tab>VITest Tests</Tab>
          </TabList>

          <TabPanels>
            {/* Live Demo Tab */}
            <TabPanel>
              <InteractiveDemo />
            </TabPanel>

            {/* Store Factory Tab */}
            <TabPanel>
              <CodeBlock language="typescript" title="Store Factory (demoStoreFactory.ts)">
{`import { Forest } from '@wonderlandlabs/forestry4';

interface UserProfile {
  name: string;
  age: number;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
  };
  errors: Record<string, string | null>;
}

export default function demoStoreFactory() {
  return new Forest<UserProfile>({
    name: 'user-profile-demo',
    value: {
      name: '',
      age: 0,
      email: '',
      preferences: { theme: 'light' },
      errors: {}
    },
    actions: {
      // Universal input handler - just handles input conversion
      handleInputChange: function(value, event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value: fieldValue, type } = event.target;

        if (type === 'number') {
          const numValue = parseInt(fieldValue) || 0;
          this.set(name, numValue);
        } else {
          this.set(name, fieldValue);
        }
      },

      handleThemeChange: function(value, event: React.ChangeEvent<HTMLSelectElement>) {
        const theme = event.target.value as 'light' | 'dark';
        // Deep set for nested property
        this.set('preferences.theme', theme);
      },

      // Update profile fields
      updateProfile: function(value, updates: Partial<UserProfile>) {
        this.mutate(draft => {
          Object.assign(draft, updates);
        });
      },

      // Update preferences
      updatePreferences: function(value, prefs: Partial<UserProfile['preferences']>) {
        this.mutate(draft => {
          Object.assign(draft.preferences, prefs);
        });
      },

      // Nested action that calls other actions
      setupUser: function(value, userData: {
        profile: Partial<UserProfile>,
        preferences: Partial<UserProfile['preferences']>
      }) {
        this.$.updateProfile(userData.profile);
        this.$.updatePreferences(userData.preferences);
      },

      // Action with validation
      setAge: function(value, age: number) {
        if (age < 0 || age > 150) {
          throw new Error('Age must be between 0 and 150');
        }
        this.mutate(draft => {
          draft.age = age;
        });
      },

      // Complex validation example
      validateAndSave: function(value) {
        const errors: string[] = [];

        if (!value.name.trim()) {
          errors.push('Name is required');
        }
        if (!value.email.includes('@')) {
          errors.push('Valid email is required');
        }
        if (value.age < 13) {
          errors.push('Must be at least 13 years old');
        }

        if (errors.length > 0) {
          throw new Error(\`Validation failed: \${errors.join(', ')}\`);
        }

        return 'Profile saved successfully!';
      }
    },
    tests: [
      (value: UserProfile) => {
        if (typeof value.name !== 'string') {
          return 'Name must be a string';
        }
        return null;
      },
      (value: UserProfile) => {
        if (typeof value.age !== 'number') {
          return 'Age must be a number';
        }
        return null;
      }
    ],
    prep: [
      // Validation prep function - runs after any state change
      function(value: UserProfile) {
        const errors: Record<string, string | null> = {};

        // Validate name
        if (!value.name.trim()) {
          errors.name = 'Name is required';
        } else if (value.name.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else {
          errors.name = null;
        }

        // Validate age
        if (value.age < 0) {
          errors.age = 'Age cannot be negative';
        } else if (value.age > 150) {
          errors.age = 'Age cannot exceed 150 years';
        } else if (value.age > 0 && value.age < 13) {
          errors.age = 'Must be at least 13 years old';
        } else {
          errors.age = null;
        }

        // Validate email
        if (value.email && !value.email.includes('@')) {
          errors.email = 'Please enter a valid email address';
        } else {
          errors.email = null;
        }

        // Update errors object using mutate to avoid recursion
        this.mutate(draft => {
          draft.errors = errors;
        });
      }
    ]
  });
}`}
              </CodeBlock>
            </TabPanel>

            {/* Component Code Tab */}
            <TabPanel>
              <SnippetBlock
                snippetName="InteractiveDemo"
                language="typescript"
                title="InteractiveDemo Component Source"
              />
            </TabPanel>
            

            {/* Jest Tests Tab */}
            <TabPanel>
              <SnippetBlock
                snippetName="demoStoreFactory-tests"
                language="typescript"
                ts={true}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Alert status="info" mt={4}>
          <AlertIcon />
          <Box>
            <Text fontWeight="semibold">Live Forestry Store in Action</Text>
            <Text fontSize="sm" mt={1}>
              This demo uses useForestryLocal hook for reactive updates.
              Switch between tabs to see the source code and try the interactive demo.
            </Text>
          </Box>
        </Alert>
      </VStack>
    </Box>
  );
};

export default LiveDemo;
