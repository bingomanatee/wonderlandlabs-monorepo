import React from 'react';
import { Card, CardBody, VStack, Heading, Text } from '@chakra-ui/react';
import TodoAppDemo from './TodoAppDemo';

const LiveTodoDemoCard: React.FC = () => {
  return (
    <Card width="full">
      <CardBody width="full">
        <VStack layerStyle="section">
          <Heading size="lg">Live Todo App Demo</Heading>
          <Text textStyle="body">
            A complete todo app showing React + Forestry 4 integration patterns:
          </Text>

          <TodoAppDemo />
        </VStack>
      </CardBody>
    </Card>
  );
};

export default LiveTodoDemoCard;
