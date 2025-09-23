import React from 'react';
import { Heading, Text, VStack } from '@chakra-ui/react';
import Section from '../Section';
import TodoAppDemo from './TodoAppDemo';

const LiveTodoDemoCard: React.FC = () => {
  return (
    <Section>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Live Todo App Demo</Heading>
        <Text color="gray.600">
          A complete todo app showing React + Forestry 4 integration patterns:
        </Text>

        <TodoAppDemo />
      </VStack>
    </Section>
  );
};

export default LiveTodoDemoCard;
