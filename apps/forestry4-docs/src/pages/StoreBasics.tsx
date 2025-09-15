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
import SnippetBlock from '../components/SnippetBlock';
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
            Create a new Store instance with configuration options. They are all optional except for
            value
          </Text>

          <SnippetBlock
            language="typescript"
            snippetName="storeConstructorSignature"
            folder="StoreBasics"
            ts={true}
          />
          <Heading size="sm">Config properties</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box>
              <Heading size="md" mb={3}>
                name <Badge colorScheme="blue">string</Badge>
              </Heading>
              <Text color="gray.600" mb={3}>
                Unique identifier for the store instance.
              </Text>
              <SnippetBlock
                language="typescript"
                snippetName="nameExample"
                folder="StoreBasics"
                ts={true}
              />
            </Box>

            <Box>
              <Heading size="md" mb={3}>
                value <Badge colorScheme="green">T</Badge> <Badge colorScheme="red">Required</Badge>
              </Heading>
              <Text color="gray.600" mb={3}>
                Initial state value for the store.
              </Text>
              <SnippetBlock
                language="typescript"
                snippetName="valueExample"
                folder="StoreBasics"
                ts={true}
              />
            </Box>

            <Box>
              <Heading size="md" mb={3}>
                actions <Badge colorScheme="purple">Record&lt;string, Function&gt;</Badge>
              </Heading>
              <Text color="gray.600" mb={3}>
                Object containing action functions for state updates.
              </Text>
              <SnippetBlock
                language="typescript"
                snippetName="actionsExample"
                folder="StoreBasics"
                ts={true}
              />
            </Box>

            <Box>
              <Heading size="md" mb={3}>
                tests <Badge colorScheme="orange">Function | Function[]</Badge>
              </Heading>
              <Text color="gray.600" mb={3}>
                Validation function to ensure state integrity. expects candidateValue as first
                argument - bound to store.
              </Text>
              <SnippetBlock
                language="typescript"
                snippetName="testsExample"
                folder="StoreBasics"
                ts={true}
              />
            </Box>
          </SimpleGrid>
          <Text size="sm">
            See <Link to="/validation">Validation</Link> for more details on Vaidation parameters
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
                snippet: 'formOnChangeHandler',
                folder: 'StoreBasics',
              },
              {
                label: 'Single Field Updates',
                language: 'typescript',
                snippet: 'singleFieldUpdates',
                folder: 'StoreBasics',
              },
              {
                label: 'Multiple Field Updates',
                language: 'typescript',
                snippet: 'multipleFieldUpdates',
                folder: 'StoreBasics',
              },
              {
                label: 'Complex Updates',
                language: 'typescript',
                snippet: 'complexUpdates',
                folder: 'StoreBasics',
              },
              {
                label: 'Validation Patterns',
                language: 'typescript',
                snippet: 'validationPatterns',
                folder: 'StoreBasics',
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
                snippet: 'liveExampleStoreDefinition',
                folder: 'StoreBasics',
              },
              {
                label: 'React Integration',
                language: 'tsx',
                snippet: 'reactIntegration',
                folder: 'StoreBasics',
              },
              {
                label: 'Form Component',
                language: 'tsx',
                snippet: 'formComponent',
                folder: 'StoreBasics',
              },
            ]}
          />
        </Section>
      </VStack>
    </Container>
  );
};

export default StoreBasics;
