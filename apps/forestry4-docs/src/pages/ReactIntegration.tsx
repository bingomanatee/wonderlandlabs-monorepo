import React from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import IntegrationPatternsCard from '../components/ReactIntegration/IntegrationPatternsCard';
import LiveTodoDemoCard from '../components/ReactIntegration/LiveTodoDemoCard';
import ReactHookPatternsCard from '../components/ReactIntegration/ReactHookPatternsCard';
import CompleteSourceCodeCard from '../components/ReactIntegration/CompleteSourceCodeCard';
import BestPracticesCard from '../components/ReactIntegration/BestPracticesCard';

const ReactIntegration: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack layerStyle="section" spacing={8}>
        {/* Header */}
        <Box>
          <Heading size="xl" mb={4}>
            React Integration
          </Heading>
          <Text textStyle="hero">
            Learn how to integrate Forestry 4 stores with React components and hooks.
          </Text>
        </Box>

        {/* Integration Patterns */}
        <IntegrationPatternsCard />
        {/* Live Todo Demo */}
        <LiveTodoDemoCard />

        {/* Hook Patterns */}
        <ReactHookPatternsCard />

        {/* Source Code */}
        <CompleteSourceCodeCard />

        {/* Best Practices */}
        <BestPracticesCard />
      </VStack>
    </Container>
  );
};

export default ReactIntegration;
