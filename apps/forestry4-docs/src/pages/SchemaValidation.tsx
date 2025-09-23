import React from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Code,
  Heading,
  ListItem,
  SimpleGrid,
  Text,
  UnorderedList,
  VStack,
} from '@chakra-ui/react';
import CodeBlock from '../components/CodeBlock';
import CodeTabs from '../components/CodeTabs.tsx';
import Section from '../components/Section';

const SchemaValidation: React.FC = () => {
  return (
    <Box maxW="6xl" mx="auto" p={6}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Schema Validation with Zod
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto">
            Use Zod schemas for runtime type validation and enhanced type safety in Forestry stores.
            Schemas provide structural validation, constraint enforcement, and clear error messages.
          </Text>
        </Box>

        {/* Key Benefits */}
        <Section>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Why Use Zod Schemas?</Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box layerStyle="card" bg="green.50">
                <Heading size="md" mb={2} color="green.700">
                  Runtime Validation
                </Heading>
                <Text fontSize="sm">
                  Catch invalid state structures at runtime, preventing bugs from malformed data
                  that TypeScript alone cannot detect.
                </Text>
              </Box>

              <Box layerStyle="card" bg="blue.50">
                <Heading size="md" mb={2} color="blue.700">
                  Type Safety
                </Heading>
                <Text fontSize="sm">
                  Generate TypeScript types directly from schemas using <Code>z.infer</Code>,
                  ensuring perfect alignment between runtime and compile-time validation.
                </Text>
              </Box>

              <Box layerStyle="card" bg="purple.50">
                <Heading size="md" mb={2} color="purple.700">
                  Constraint Enforcement
                </Heading>
                <Text fontSize="sm">
                  Define business rules like min/max values, string patterns, and array lengths
                  directly in the schema for automatic validation.
                </Text>
              </Box>

              <Box layerStyle="card" bg="orange.50">
                <Heading size="md" mb={2} color="orange.700">
                  Clear Error Messages
                </Heading>
                <Text fontSize="sm">
                  Zod provides detailed, human-readable error messages that help developers quickly
                  identify and fix validation issues.
                </Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </Section>

        {/* Basic Schema Setup */}
        <Section>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Basic Schema Setup</Heading>
            <Text color="gray.600">
              Define your state schema and use it as the <Code>schema</Code> property in Store
              constructor. Forestry will automatically validate state changes against this schema.
            </Text>

            <CodeBlock
              language="typescript"
              snippetName="zodSchemaValidation"
              folder="ActionsState"
            />
          </VStack>
        </Section>

        {/* Schema Patterns */}
        <Section>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Common Schema Patterns</Heading>

            <CodeTabs
              tabs={[
                {
                  label: 'Basic Types',
                  language: 'typescript',
                  snippet: 'basicTypes',
                  folder: 'SchemaValidation',
                },
                {
                  label: 'Complex Objects',
                  language: 'typescript',
                  snippet: 'complexObjects',
                  folder: 'SchemaValidation',
                },
                {
                  label: 'Arrays & Validation',
                  language: 'typescript',
                  snippet: 'arraysValidation',
                  folder: 'SchemaValidation',
                },
                {
                  label: 'Conditional Logic',
                  language: 'typescript',
                  snippet: 'conditionalLogic',
                  folder: 'SchemaValidation',
                },
              ]}
            />
          </VStack>
        </Section>

        {/* Integration with Prep Functions */}
        <Section>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Integration with Prep Functions</Heading>
            <Text color="gray.600">
              While schemas handle structural validation, prep functions handle business logic and
              user input validation. They work together for comprehensive validation.
            </Text>

            <Alert status="info">
              <AlertIcon />
              <Box>
                <Text fontWeight="semibold">Schema vs Prep Validation</Text>
                <UnorderedList mt={2} spacing={1}>
                  <ListItem>
                    <strong>Schema:</strong> Structure, types, constraints (throws errors)
                  </ListItem>
                  <ListItem>
                    <strong>Prep:</strong> Business rules, user input (sets quality feedback)
                  </ListItem>
                </UnorderedList>
              </Box>
            </Alert>

            <CodeBlock
              language="typescript"
              snippetName="schemaPrepIntegration"
              folder="SchemaValidation"
            />
          </VStack>
        </Section>

        {/* Best Practices */}
        <Section>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Schema Best Practices</Heading>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Box>
                <Heading size="md" mb={3} color="green.600">
                  ✅ Do
                </Heading>
                <VStack spacing={3} align="stretch">
                  <Box layerStyle="highlight" bg="green.50">
                    <Text fontWeight="semibold">Define schemas at factory level</Text>
                    <Text fontSize="sm" color="gray.600">
                      Create schemas alongside your factory functions for reusability
                    </Text>
                  </Box>
                  <Box layerStyle="highlight" bg="green.50">
                    <Text fontWeight="semibold">Use meaningful constraints</Text>
                    <Text fontSize="sm" color="gray.600">
                      Add min/max, patterns, and business-relevant validation rules
                    </Text>
                  </Box>
                  <Box layerStyle="highlight" bg="green.50">
                    <Text fontWeight="semibold">Infer TypeScript types</Text>
                    <Text fontSize="sm" color="gray.600">
                      Use <Code>z.infer&lt;typeof Schema&gt;</Code> for type safety
                    </Text>
                  </Box>
                </VStack>
              </Box>

              <Box>
                <Heading size="md" mb={3} color="red.600">
                  ❌ Don't
                </Heading>
                <VStack spacing={3} align="stretch">
                  <Box layerStyle="highlight" bg="red.50">
                    <Text fontWeight="semibold">Duplicate validation logic</Text>
                    <Text fontSize="sm" color="gray.600">
                      Don't repeat schema constraints in prep functions
                    </Text>
                  </Box>
                  <Box layerStyle="highlight" bg="red.50">
                    <Text fontWeight="semibold">Over-constrain schemas</Text>
                    <Text fontSize="sm" color="gray.600">
                      Keep schemas focused on structure, not business rules
                    </Text>
                  </Box>
                  <Box layerStyle="highlight" bg="red.50">
                    <Text fontWeight="semibold">Ignore schema errors</Text>
                    <Text fontSize="sm" color="gray.600">
                      Schema validation errors indicate serious structural issues
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Section>
      </VStack>
    </Box>
  );
};

export default SchemaValidation;
