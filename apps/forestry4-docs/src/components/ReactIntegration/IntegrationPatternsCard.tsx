import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import Section from '../Section';
import CodePanel from '../CodePanel';

const IntegrationPatternsCard: React.FC = () => {
  return (
    <Section>
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
          <CodePanel language="typescript" snippetName="forestryHooks" folder="ReactIntegration" />
        </Box>
      </VStack>
    </Section>
  );
};

export default IntegrationPatternsCard;
