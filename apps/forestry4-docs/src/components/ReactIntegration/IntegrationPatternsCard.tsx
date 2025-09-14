import React from 'react';
import { Card, CardBody, VStack, Heading, Text, SimpleGrid, Box } from '@chakra-ui/react';
import SnippetBlock from '../SnippetBlock';

const IntegrationPatternsCard: React.FC = () => {
  return (
    <Card width="full">
      <CardBody>
        <VStack layerStyle="section">
          <Heading size="lg">Integration Patterns</Heading>
          <Text textStyle="body">
            Forestry 4 integrates seamlessly with React using standard hooks and patterns.
          </Text>
          <Box width="full">
            <Heading size="md" mb={3}>
              Hook Usage
            </Heading>
            <Text textStyle="body">Use Forestry hooks to connect stores to React components.</Text>
            <SnippetBlock snippetName="forestryHooks" folder="ReactIntegration" />
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default IntegrationPatternsCard;
