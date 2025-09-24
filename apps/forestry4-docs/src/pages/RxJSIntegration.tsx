import React from 'react';
import { Badge, Box, Container, Heading, Text } from '@chakra-ui/react';
import Section from '@/components/Section';

const RxJSIntegration: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Heading size="xl" mb={4}>
        RxJS Integration
        <Badge ml={3} colorScheme="purple">
          Power Tool
        </Badge>
      </Heading>
      <Section title="Leverage RxJS operators and reactive programming patterns with Forestry 4">
        <Box>
          <Text mt={4}>
            Every Forest instance exposes an rxjs <code>$subject</code>. You can observe or{' '}
            <code>.pipe(...)</code> a stores' output to throttle it, or combine or modify store
            stream(s).
          </Text>

          <Text>
            Stores follow the observable pattern closely; they don't immediately derive from
            BehaviorSubjects but they do follow the pattern - methods like
            <code>next(.candidate), .complete(), .subscribe(listener)</code>
            behave as you would expect for an RxJS Observable.
          </Text>
        </Box>
      </Section>
      <Section title="Immer values for consisntly unique values">
        <Box>
          <Text fontSize="lg">
            <a href="https://immerjs.github.io/immer/">Immer</a> enforces immutability and as a side
            effect unique references in store values
          </Text>
          <Text mt={4}>
            Like ReactToolkit, values in states are immutable; this has strong benefits in react
            ensuring that for instance, every time you add an element to an array or map, its
            returned as a new array or map every time, triggering updates to dependency lists or
            components.
          </Text>

          <Text>
            the <code>.mutate(fn)</code> method in stores are in fact wrappers for
            <a target="_new" href="https://immerjs.github.io/immer/produce/">
              Immer's produce(fn)
            </a>{' '}
            utility.
          </Text>
        </Box>
      </Section>
    </Container>
  );
};

export default RxJSIntegration;
