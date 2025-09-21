// Auto-generated snippet from: apps/forestry4-docs/src/pages/examples/ShoppingCart.tsx
// Description: Shopping cart example page
// Last synced: Sat Sep 20 19:53:27 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Container,
  Heading,
  List,
  ListIcon,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import ShoppingCartDemo from '../../components/ValidationSystem/ShoppingCartDemo';
import Section from '@/components/Section.tsx';

const ShoppingCart: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack layerStyle="section" spacing={8}>
        {/* Header */}
        <Box textAlign="center">
          <Heading size="xl" mb={4}>
            Shopping Cart Example
            <Badge ml={3} colorScheme="purple">
              Validation Focus
            </Badge>
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            A shopping cart application demonstrating Forestry 4's validation system, schema
            integration, and complex business logic handling.
          </Text>
        </Box>

        <ShoppingCartDemo />

        {/* Key Features */}
        <Section title="Key Features">
          <List spacing={2}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Zod Schema Validation:</strong> Type-safe validation with detailed error
              messages
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Custom Test Functions:</strong> Business logic validation (inventory, pricing)
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Real-time Validation:</strong> Immediate feedback on user interactions
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Complex State Management:</strong> Cart items, totals, discounts, shipping
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Error Handling:</strong> Graceful handling of validation failures
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Transaction Safety:</strong> Atomic operations for cart modifications
            </ListItem>
          </List>
        </Section>

        {/* Validation Strategy */}
        <Section title="Validation Strategy">
          <VStack spacing={4} align="stretch">
            <Box>
              <Heading size="sm" mb={2}>
                Schema Validation (Zod)
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Ensures data types, required fields, and basic constraints are met. Provides
                detailed error messages for each field.
              </Text>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>
                Business Logic Tests
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Custom validation functions that check inventory availability, pricing rules,
                discount eligibility, and shipping constraints.
              </Text>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>
                Real-time Feedback
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Validation runs on every state change, providing immediate feedback without waiting
                for form submission.
              </Text>
            </Box>
          </VStack>
        </Section>
        <Section title="Critical Business Rules">
          <Text color="gray.600">
            This example demonstrates validation for critical business rules that should prevent
            invalid states from being saved. These are "quantum constraints" and system limits that
            protect data integrity. Unlike formatting for structure enforced by schema, these are
            dynamic rules that require code introspection to enforce
          </Text>

          <UnorderedList>
            <ListItem>
              <strong>No duplicates</strong> - Same product can't appear twice (use quantity
              instead)
            </ListItem>
            <ListItem>
              <strong>No negative quantities</strong> - Quantities must be positive integers
            </ListItem>
            <ListItem>
              <strong>Stock limits</strong> - Cannot exceed available inventory
            </ListItem>
            <ListItem>
              <strong>Valid products only</strong> - Products must exist in catalog
            </ListItem>
            <ListItem>
              <strong>System limits</strong> - Maximum 100 total items per cart
            </ListItem>
          </UnorderedList>
        </Section>

        {/* Schema Structure */}
        <Section title="schema and validation">
          <Text mb={4} color="gray.600">
            The shopping cart uses layered validation with Zod schemas for type safety and custom
            test functions for business logic. View the complete schema and validation code in the
            "Schema & Validation" tab above.
          </Text>
        </Section>

        {/* Store Actions */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Store Actions
          </Heading>
          <Text mb={4} color="gray.600">
            The shopping cart store includes comprehensive actions for cart management, validation,
            and checkout processing. View the complete store actions implementation in the "Store
            Actions" tab above.
          </Text>
        </Box>

        {/* Best Practices */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Validation Best Practices
          </Heading>
          <List spacing={3}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Layered Validation:</strong> Use schema for data types, tests for business
              logic
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Immediate Feedback:</strong> Validate on every state change for better UX
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Detailed Error Messages:</strong> Provide specific, actionable error
              information
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Transaction Safety:</strong> Use transactions for multi-step operations
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Graceful Degradation:</strong> Handle validation failures without breaking the
              UI
            </ListItem>
          </List>
        </Box>
      </VStack>
    </Container>
  );
};

export default ShoppingCart;
