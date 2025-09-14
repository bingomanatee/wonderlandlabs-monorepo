import React from 'react';
import {
  Card,
  CardBody,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Box,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import SnippetBlock from '../SnippetBlock';

const ReactHookPatternsCard: React.FC = () => {
  return (
    <>
      <Card width="full">
        <CardBody>
          <VStack layerStyle="section">
            <Heading size="lg">React Hook Patterns</Heading>

            <Box>
              <Heading size="md" mb={3}>
                Forestry Hook Source Code
              </Heading>
              <Text textStyle="body">
                Here are the complete implementations of Forestry's React integration hooks:
              </Text>

              <VStack layerStyle="section" align="stretch" width="full">
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    useForestryLocal - Local Store Management
                  </Text>
                  <Text textStyle="description">
                    Creates and manages a store instance using useRef pattern, returns [value,
                    store]
                  </Text>
                  <SnippetBlock snippetName="useForestryLocalSource" folder="ReactIntegration" />
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    useObserveForest - External Store Observation
                  </Text>
                  <Text textStyle="description">
                    Observes an existing store/forest instance, returns just the value
                  </Text>
                  <SnippetBlock snippetName="useObserveForestSource" folder="ReactIntegration" />
                </Box>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Box>
            <Heading size="md" mb={3}>
              Referential Integrity with Immer
            </Heading>
            <Text textStyle="body">
              Forestry uses Immer internally, which ensures that any changed value is always
              referentially unique. This means you can trust any component of state to drive
              useEffect dependencies correctly.
            </Text>
            <SnippetBlock snippetName="referentialIntegrity" folder="ReactIntegration" />

            <Alert status="info" mt={4}>
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Key Benefit:</Text>
                <Text>
                  Unlike manual state management where you might accidentally mutate objects and
                  break React's dependency system, Forestry eliminates this entire class of bugs
                  through Immer's referential integrity.
                </Text>
              </Box>
            </Alert>
          </Box>
        </CardBody>
      </Card>
    </>
  );
};

export default ReactHookPatternsCard;
