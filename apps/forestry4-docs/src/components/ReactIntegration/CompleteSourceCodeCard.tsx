import React from 'react';
import { Heading, Text, VStack } from '@chakra-ui/react';
import Section from '../Section';
import CodeTabs from '../CodeTabs.tsx';

const CompleteSourceCodeCard: React.FC = () => {
  return (
    <Section>
      <VStack layerStyle="section">
        <Heading size="lg">Complete Source Code</Heading>
        <Text textStyle="body">Here's the complete implementation of the todo app above:</Text>

        <CodeTabs
          tabs={[
            {
              label: 'Store Factory',
              language: 'typescript',
              snippet: 'todoStoreFactory',
              folder: 'ReactIntegration',
            },
            {
              label: 'React Component',
              language: 'tsx',
              snippet: 'todoAppComponent',
              folder: 'ReactIntegration',
            },
          ]}
        />
      </VStack>
    </Section>
  );
};

export default CompleteSourceCodeCard;
