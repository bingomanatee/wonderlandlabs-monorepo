import React from 'react';
import { Badge, Box, Container, Heading, Image, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import CodeTabs from '../components/CodeTabs.tsx';
import CodePanel from '../components/CodePanel';
import { Link } from 'react-router-dom';
import Section from '../components/Section';
import UserProfileDemo from '../components/examples/UserProfileDemo';

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
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading variant="page">Forest Overview</Heading>
          <Text textStyle="hero">
            The Forest class is the core of Forestry 4, providing reactive state management with
            validation and transaction support. Stores extend off of this class to decorate it with
            actions and property selectors
          </Text>
        </Box>

        {/* Constructor Section */}
        <Section title="Constructor">
          <Text color="gray.600">
            Create a new Forest class for the root Store, with configuration options and{' '}
            <Link to="actions">methods for modifying state</Link>. They are all optional except for
            value.
          </Text>

          <CodePanel
            language="typescript"
            snippetName="storeConstructorSignature"
            folder="StoreBasics"
            ts={true}
          />
          <Heading variant="subtle">Config properties</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box>
              <Heading size="md" mb={3}>
                value <Badge colorScheme="red">Required</Badge>
              </Heading>
              <Text color="gray.600" mb={3}>
                Initial state value for the store. It can be an object, static (number, string),
                Map, Set, Array, etc.; it is an Immerable value; in short any JSON-able entity with
                the addition of Map and Set options.
              </Text>
              <CodePanel
                language="typescript"
                snippetName="valueExample"
                folder="StoreBasics"
                ts={true}
              />
            </Box>
            <Box>
              <Heading size="md" mb={3}>
                tests <Badge colorScheme="orange">Function | Function[]</Badge> and schema{' '}
                <Badge colorScheme="orange">Zod instance</Badge>
              </Heading>
              <Text color="gray.600" mb={3}>
                <ul>
                  <li>
                    <b>Schema</b>
                    <br /> (a la Zod) defines the required structure of data in the value.
                  </li>
                  <li>
                    <b>tests</b>
                    <br />A function (or an array of functions) to ensure state integrity.
                  </li>
                </ul>
              </Text>
              <CodePanel
                language="typescript"
                snippetName="testsExample"
                folder="StoreBasics"
                ts={true}
              />

              <Text size="sm">
                See <Link to="/validation">Validation</Link> for more details on Vaidation
                parameters
              </Text>
            </Box>
            <Box>
              <Heading size="md" mb={3}>
                name <Badge colorScheme="blue">string</Badge>
              </Heading>
              <Text color="gray.600" mb={3}>
                Unique identifier for the store instance.
              </Text>
              <CodePanel
                language="typescript"
                snippetName="nameExample"
                folder="StoreBasics"
                ts={true}
              />
            </Box>
          </SimpleGrid>
        </Section>

        <Section>
          <Heading>The Forestry Lifecycle</Heading>
          <Image src="/img/forstry-flowchart-simple.svg" width="full" mx={8} maxHeight="80vh" />
          <Text>
            Instead of an unregulated update (as is the case with useState/Redux) Forest offers
            optional interrupts to both sanitize and validate the data before it is committed. This
            includes comparing it to the defined schema and running any manual test functions.
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

          <UserProfileDemo />
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
