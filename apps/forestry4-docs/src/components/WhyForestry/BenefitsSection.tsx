import React from 'react';
import {
  Box,
  Heading,
  Icon,
  List,
  ListIcon,
  ListItem,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { CheckIcon, StarIcon } from '@chakra-ui/icons';

const BenefitsSection: React.FC = () => {
  return (
    <VStack spacing={8} align="stretch">
      <Box textAlign="center">
        <Heading size="xl" mb={4}>
          Why Choose Forestry?
        </Heading>
        <Text textStyle="hero">
          Forestry provides a powerful, type-safe, and intuitive approach to state management that
          scales from simple components to complex applications.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        <Box layerStyle="card" bg="blue.50">
          <Icon as={StarIcon} color="blue.500" boxSize={8} mb={4} />
          <Heading variant="card" color="blue.700">
            Type Safety First
          </Heading>
          <List spacing={2}>
            <ListItem>
              <ListIcon as={CheckIcon} color="blue.500" />
              Full TypeScript integration
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="blue.500" />
              Compile-time error detection
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="blue.500" />
              IntelliSense support
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="blue.500" />
              Zod schema validation
            </ListItem>
          </List>
        </Box>

        <Box layerStyle="card" bg="green.50">
          <Icon as={StarIcon} color="green.500" boxSize={8} mb={4} />
          <Heading variant="card" color="green.700">
            Reactive by Design
          </Heading>
          <List spacing={2}>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.500" />
              RxJS-powered reactivity
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.500" />
              Automatic UI updates
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.500" />
              Efficient change detection
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.500" />
              Subscription management
            </ListItem>
          </List>
        </Box>

        <Box layerStyle="card" bg="purple.50">
          <Icon as={StarIcon} color="purple.500" boxSize={8} mb={4} />
          <Heading variant="card" color="purple.700">
            Developer Experience
          </Heading>
          <List spacing={2}>
            <ListItem>
              <ListIcon as={CheckIcon} color="purple.500" />
              Intuitive API design
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="purple.500" />
              Minimal boilerplate
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="purple.500" />
              Built-in testing tools
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="purple.500" />
              Excellent debugging
            </ListItem>
          </List>
        </Box>

        <Box layerStyle="card" bg="orange.50">
          <Icon as={StarIcon} color="orange.500" boxSize={8} mb={4} />
          <Heading variant="card" color="orange.700">
            Validation & Quality
          </Heading>
          <List spacing={2}>
            <ListItem>
              <ListIcon as={CheckIcon} color="orange.500" />
              Three-layer validation
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="orange.500" />
              Runtime type checking
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="orange.500" />
              Quality feedback system
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="orange.500" />
              Error boundary support
            </ListItem>
          </List>
        </Box>

        <Box layerStyle="card" bg="teal.50">
          <Icon as={StarIcon} color="teal.500" boxSize={8} mb={4} />
          <Heading variant="card" color="teal.700">
            Scalable Architecture
          </Heading>
          <List spacing={2}>
            <ListItem>
              <ListIcon as={CheckIcon} color="teal.500" />
              Modular store design
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="teal.500" />
              Forest branching system
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="teal.500" />
              Factory pattern support
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="teal.500" />
              Dependency injection
            </ListItem>
          </List>
        </Box>

        <Box layerStyle="card" bg="red.50">
          <Icon as={StarIcon} color="red.500" boxSize={8} mb={4} />
          <Heading variant="card" color="red.700">
            React Integration
          </Heading>
          <List spacing={2}>
            <ListItem>
              <ListIcon as={CheckIcon} color="red.500" />
              Custom React hooks
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="red.500" />
              Automatic cleanup
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="red.500" />
              SSR compatibility
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="red.500" />
              DevTools integration
            </ListItem>
          </List>
        </Box>
      </SimpleGrid>
    </VStack>
  );
};

export default BenefitsSection;
