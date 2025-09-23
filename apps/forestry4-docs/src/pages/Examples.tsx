import React from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  HStack,
  Icon,
  Link,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { CheckCircleIcon, LockIcon, SettingsIcon, StarIcon } from '@chakra-ui/icons';

const Examples: React.FC = () => {
  const examples = [
    {
      title: 'Todo App',
      path: '/examples/todo-app',
      badge: 'Classic example',
      badgeColor: 'green',
      icon: CheckCircleIcon,
      description:
        'A fully-featured todo application demonstrating action-based architecture, form handling, and React integration patterns.',
      features: [
        'Fully dynamic properties',
        'Event Listeners',
        'Reactive feedback from data summary',
      ],
    },
    {
      title: 'Shopping Cart',
      path: '/examples/shopping-cart',
      badge: 'Validation',
      badgeColor: 'purple',
      icon: StarIcon,
      description:
        "A shopping cart application showcasing Forestry 4's validation system, schema integration, and complex business logic.",
      features: [
        'Zod Schema Validation',
        'Custom Test Functions',
        'Real-time Validation',
        'Complex State Management',
      ],
    },
    {
      title: 'Form Validation',
      path: '/examples/form-validation',
      badge: 'Form Patterns',
      badgeColor: 'blue',
      icon: SettingsIcon,
      description:
        'Advanced form validation with field-level validation, cross-field dependencies, and async validation patterns.',
      features: [
        'Field-Level Validation',
        'Cross-Field Dependencies',
        'Async Validation',
        'Error State Management',
      ],
    },
    {
      title: 'Transaction Demo',
      path: '/examples/transaction-demo',
      badge: 'Atomic mutation',
      badgeColor: 'orange',
      icon: LockIcon,
      description:
        'Comprehensive transaction system example demonstrating atomic operations, rollback capabilities, and complex state management.',
      features: [
        'Atomic Operations',
        'Automatic Rollback',
        'Nested Transactions',
        'Performance Optimization',
      ],
    },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading variant="page">Practical Examples</Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
            Functioning examples demonstrating Forestry 4's capabilities in various scenarios. Each
            example showcases different aspects of the library with complete, working code.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {examples.map((example) => (
            <Card
              key={example.path}
              as={RouterLink}
              to={example.path}
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'lg',
                textDecoration: 'none',
              }}
              transition="all 0.2s"
              cursor="pointer"
            >
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between" align="start">
                    <HStack>
                      <Icon as={example.icon} color="forest.500" boxSize={5} />
                      <Heading variant="card">{example.title}</Heading>
                    </HStack>
                    <Badge colorScheme={example.badgeColor} variant="subtle">
                      {example.badge}
                    </Badge>
                  </HStack>

                  <Text color="gray.600" fontSize="sm">
                    {example.description}
                  </Text>

                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700">
                      Key Features:
                    </Text>
                    <VStack align="stretch" spacing={1}>
                      {example.features.map((feature) => (
                        <HStack key={feature} spacing={2}>
                          <CheckCircleIcon color="green.500" boxSize={3} />
                          <Text fontSize="sm" color="gray.600">
                            {feature}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>

                  <HStack justify="flex-end" width="full" flex={0}>
                    <Link
                      as="span"
                      color="forest.600"
                      fontWeight="semibold"
                      fontSize="sm"
                      _hover={{ color: 'forest.700' }}
                    >
                      <Button colorScheme="green" size="lg">
                        View Example
                      </Button>
                    </Link>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        <Box textAlign="center" mt={8}>
          <Text color="gray.500" fontSize="sm">
            More examples coming soon! Each example includes live demos, complete source code, and
            detailed explanations of the patterns used.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default Examples;
