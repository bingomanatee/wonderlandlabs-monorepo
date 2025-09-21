import React from 'react';
import { Box, VStack, Text, Heading } from '@chakra-ui/react';
import ShoppingCartDemoComponent from '../../examples/shopping-cart/ShoppingCartDemoComponent';
import CodeTabs from '@/components/CodeTabs.tsx';
import Section from '../Section';

const ShoppingCartDemo: React.FC = () => {
  return (
    <Section>
      <VStack spacing={6} align="stretch">
        {/* Live Demo */}
        <ShoppingCartDemoComponent />

        {/* Source Code Section */}
        <Box>
          <Heading size="md" mb={4}>
            Source Code - Error Handling with Toasts
          </Heading>
          <Text color="gray.600" mb={4}>
            Here's how to implement global error handling with Chakra UI toasts for validation
            errors:
          </Text>

          <CodeTabs
            tabs={[
              {
                label: 'Demo Component',
                language: 'tsx',
                snippet: 'shopping-cart-demo-component',
              },
              {
                label: 'Store Factory',
                language: 'typescript',
                snippet: 'shoppingCartStoreFactory',
              },
              {
                label: 'Schema & Validation',
                language: 'typescript',
                snippet: 'shopping-cart-schema-validation',
              },
              {
                label: 'Unit Tests',
                language: 'typescript',
                snippet: 'shopping-cart-example-tests',
              },
            ]}
          />
        </Box>
      </VStack>
    </Section>
  );
};

export default ShoppingCartDemo;
