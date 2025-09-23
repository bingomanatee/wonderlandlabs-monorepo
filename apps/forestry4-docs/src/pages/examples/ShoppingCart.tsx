import React from 'react';
import {
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
      </VStack>
    </Container>
  );
};

export default ShoppingCart;
