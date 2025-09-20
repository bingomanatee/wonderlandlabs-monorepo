import React from 'react';
import {
  Badge,
  Box,
  Heading,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import CodeTabs from '../CodeTabs.tsx';
import { Link } from 'react-router-dom';

const ComparisonSection: React.FC = () => {
  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="xl" mb={4}>
          Yet Another Store System?
        </Heading>
        <Text fontSize="lg" color="gray.600" maxW="3xl">
          Forestry grew from a profound disaffection in the status quo. Redux, mainly but also a lot
          of other alternatives including hooks. I saw the same patterns happening over and over
          again:
          <ul>
            <li>
              <b>A lack of the ability to synchronously update state</b>. There is no inbuilt reason
              that local state needs to be forced into async patterns. (as is the case in hooks)
              like RxJs (the backbone of Forestry) you should be able to change state and see
              results in real time. hooks for instnace are particularly poor at reflecting the real
              time state of anything given the large refresh cycle of useState.
            </li>
            <li>
              <b>Far too much magic</b>. Actions should be straight up javascript code with as
              little magic as necessary.
            </li>
            <li>
              <b>Had coded state that is difficult to test</b>. Most state systems are so wed to
              their context that they are difficult to isolate; this violates separation of concerns
              and frankly most React testing is so painful that it behooves you to extricate the
              business logic and enable independent testing.
            </li>
            <li>
              <b>Abdication of responsibility for schema enforcement</b>; validation of change
              values before they are submitted into state is not something to be put in as optional
              nice to have or assumed to be a "solved problem" with typescript. State data is
              dynamic and often comes from sources outside the codebase (fetch), so typescript
              cannot enforce type sanity - state must take that responsibility to heart.
            </li>
            <li>
              <b>Lack of transactional atomicity</b>; often you need to make several changes in
              sequence and have them all succeed or fail; especially important with the use of
              nested actions. Forestry even allows you to temporarily suspend validation constraints
              while you change state over several steps as long as the net effect of transactions
              produce valid data.
            </li>
            <li>
              <b>Nested Actions</b>; composition is very difficult or impossible in many state
              systems; Forestry allows you to drill deep into multiple actions.
            </li>
          </ul>
          Foresty has been written to address these features point by point. Many of the solutions
          are "passive" - some like <Link to="/validation">Validation</Link>
          require some tooling.
        </Text>
      </Box>

      {/* Feature Comparison Table */}
      <Box layerStyle="card" bg="gray.50">
        <Heading variant="section">Feature Comparison</Heading>
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Feature</Th>
                <Th textAlign="center">Forestry</Th>
                <Th textAlign="center">Redux</Th>
                <Th textAlign="center">Zustand</Th>
                <Th textAlign="center">Jotai</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td fontWeight="semibold">TypeScript Support</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Excellent</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Good</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Excellent</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Excellent</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Boilerplate</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Minimal</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Heavy</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Minimal</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Medium</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Validation</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Built-in</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">External</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">External</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">External</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Reactivity</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">RxJS</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Manual</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Manual</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Automatic</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">DevTools</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Built-in</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Excellent</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Basic</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Basic</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Learning Curve</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Gentle</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Steep</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Gentle</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Medium</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Action Testability</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Excellent</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Complex</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Manual</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Manual</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Atomic Operations</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Built-in</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Manual</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Manual</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Manual</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Context Independence</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Complete</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Coupled</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Partial</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Partial</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Real-time Feedback</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Synchronous</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Async Only</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Limited</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Limited</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Bundle Size</Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Medium</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Large</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Small</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Small</Badge>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* Code Comparison */}
      <Box layerStyle="card" bg="blue.50">
        <Heading size="lg" mb={6}>
          Code Comparison
        </Heading>
        <Text color="gray.600" mb={6}>
          Compare how the same functionality looks across different state management solutions.
        </Text>

        <CodeTabs
          tabs={[
            {
              label: 'Forestry',
              language: 'typescript',
              snippet: 'forestryExample',
              folder: 'WhyForestry',
            },
            {
              label: 'Redux Toolkit',
              language: 'typescript',
              snippet: 'reduxExample',
              folder: 'WhyForestry',
            },
            {
              label: 'Zustand',
              language: 'typescript',
              snippet: 'zustandExample',
              folder: 'WhyForestry',
            },
          ]}
        />
      </Box>

      {/* Key Differentiators */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Box layerStyle="card" bg="green.50">
          <Heading variant="card" color="green.700">
            ✅ Forestry Advantages
          </Heading>
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm">
              <strong>Built-in Validation:</strong> Three-layer validation system with runtime
              checks
            </Text>
            <Text fontSize="sm">
              <strong>RxJS Integration:</strong> Powerful reactive programming capabilities
            </Text>
            <Text fontSize="sm">
              <strong>Forest Branching:</strong> Unique field-level state management for forms
            </Text>
            <Text fontSize="sm">
              <strong>Quality Feedback:</strong> User-friendly validation messages
            </Text>
            <Text fontSize="sm">
              <strong>Factory Pattern:</strong> Dependency injection and reusable store creation
            </Text>
          </VStack>
        </Box>

        <Box layerStyle="card" bg="orange.50">
          <Heading variant="card" color="orange.700">
            ⚠️ Trade-offs
          </Heading>
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm">
              <strong>Learning Curve:</strong> New concepts like Forest branching and validation
              layers
            </Text>
            <Text fontSize="sm">
              <strong>Bundle Size:</strong> RxJS dependency adds to bundle size
            </Text>
            <Text fontSize="sm">
              <strong>Ecosystem:</strong> Newer library with smaller community
            </Text>
            <Text fontSize="sm">
              <strong>Documentation:</strong> Still growing compared to established solutions
            </Text>
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  );
};

export default ComparisonSection;
