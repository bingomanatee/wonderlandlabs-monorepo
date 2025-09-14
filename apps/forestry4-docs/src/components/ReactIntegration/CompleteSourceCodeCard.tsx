import React from 'react';
import { Card, CardBody, VStack, Heading, Text } from '@chakra-ui/react';
import CodeTabs from '../CodeTabs';

const CompleteSourceCodeCard: React.FC = () => {
  return (
    <Card width="full">
      <CardBody>
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
      </CardBody>
    </Card>
  );
};

export default CompleteSourceCodeCard;
