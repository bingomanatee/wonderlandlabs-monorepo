import React from 'react';
import { Container, Heading, Text, Box, Badge } from '@chakra-ui/react';

const RxJSIntegration: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box>
        <Heading size="xl" mb={4}>
          RxJS Integration
          <Badge ml={3} colorScheme="purple">
            Power Tool
          </Badge>
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Leverage RxJS operators and reactive programming patterns with Forestry 4.
        </Text>
        <Text mt={4} color="gray.500">
          Every store exposes an rxjs subject. you can observe or <code>.pipe(...)</code>a stores'
          output to throttle it, or conbine or modify store stream(s).
        </Text>

        <Text>
          Stores follow the observable pattern closely; they don't immediately derive from
          BehaviorSubjects but they do follow the pattern - methods like{' '}
          <code>next(candidate), complete, subscribe</code>
          behave as you would expect for an RxJS Observable.
        </Text>
      </Box>

      <Box>
        <Heading size="xl" mb={4}>
          Immer
        </Heading>
        <Text fontSize="lg" color="gray.600">
          <a href="https://immerjs.github.io/immer/">Immer</a> enforces immutability and as a side
          effect unique references in store values
        </Text>
        <Text mt={4} color="gray.500">
          Like ReactToolkit, values in states are immutable; this has strong benefits in react
          ensuring that for instance, every time you add an element to an array or map, its returned
          as a new array or map every time, triggering updates to dependency lists or components.
        </Text>

        <Text>
          the <code>.mutate()</code> method in stores are in fact wrappers for immer providers.
        </Text>
      </Box>
    </Container>
  );
};

export default RxJSIntegration;
