import React from 'react';
import {   VStack, Heading, Text, SimpleGrid, Box } from '@chakra-ui/react';
import Section from '../Section';
const BestPracticesCard: React.FC = () => {
  return (
    <Section>
      
        <VStack layerStyle="section">
          <Heading size="lg">React Integration Best Practices</Heading>
          <Text>
            React is "quirky" about some features; the hooks above take care of all these concerns
            but if you plan to integrate Forestry with your own code or custom hooks follow these
            guidelines.
          </Text>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Box>
              <Heading size="md" mb={3} color="green.600">
                ✅ Best Practices
              </Heading>
              <VStack layerStyle="section" spacing={3} align="stretch">
                <Box p={3} bg="green.50" borderRadius="md">
                  <Text fontWeight="semibold">Use Forestry hooks to reduce blend boilerplate</Text>
                  <Text fontSize="sm" color="gray.600">
                    You can subscribe in useEffect and store stores in ref -- but the hooks take
                    care of a lot of housekeeping. At this point the hooks are not in the component
                    - you'll have to bring the in, because it frees you to use your current react
                    version (or Preact or whatever)
                  </Text>
                </Box>
                <Box p={3} bg="green.50" borderRadius="md">
                  <Text fontWeight="semibold">Trust referential integrity</Text>
                  <Text fontSize="sm" color="gray.600">
                    given all parts of a store changes when part of it changes, you can trust any
                    part of the store in dependency arrays to properly trigger useEffect
                  </Text>
                </Box>
                <Box p={3} bg="green.50" borderRadius="md">
                  <Text fontWeight="semibold">Diminish Hooks whenever possible</Text>
                  <Text fontSize="sm" color="gray.600">
                    Using store values or selector actions reduces the number of callbacks or memos
                    you have to put in your component body.
                  </Text>
                </Box>
                <Box p={3} bg="green.50" borderRadius="md">
                  <Text fontWeight="semibold">Pass whole stores via context or params</Text>
                  <Text fontSize="sm" color="gray.600">
                    Rather than deconstructing actions or values down deep paths, pass the whole
                    store and its value down or through context.
                  </Text>
                </Box>
              </VStack>
            </Box>

            <Box>
              <Heading size="md" mb={3} color="red.600">
                ❌ Things that will not work well
              </Heading>
              <VStack layerStyle="section" spacing={3} align="stretch">
                <Box p={3} bg="red.50" borderRadius="md">
                  <Text fontWeight="semibold">Mutate store values directly</Text>
                  <Text fontSize="sm" color="gray.600">
                    Immer won't let you do that - use mutate or set to alter parts or all of the
                    store value.
                  </Text>
                </Box>
                <Box p={3} bg="red.50" borderRadius="md">
                  <Text fontWeight="semibold">Create stores in component function body</Text>
                  <Text fontSize="sm" color="gray.600">
                    If you don't use the factory hooks, create stores in memos or via careful use of
                    refs.
                  </Text>
                </Box>
              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>
      
    </Section>
  );
};

export default BestPracticesCard;
