import React from 'react';
import { Box, Code, Container, Heading, List, ListItem, Text, VStack } from '@chakra-ui/react';
import CodePanel from '@/components/CodePanel';
import Section from '@/components/Section';

const BoundMethods: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading variant="page">Bound Methods</Heading>
          <Text textStyle="hero">
            Use <Code>$bound</Code> to pass store methods as stable callbacks.
          </Text>
        </Box>

        <Section title="What $bound exposes">
          <Text textStyle="body">
            <Code>$bound</Code> is a bound mirror of any methods you create on a class that extends
            Forest. Each function runs with <Code>this</Code> set to the store instance. It includes{' '}
            <Code>get</Code> and <Code>set</Code>, excludes getters, and excludes methods whose
            names start with <Code>$</Code>. <Code>$bound</Code>
            is a more semantic alias for
            <Code>$</Code>; either can be used to expose bound methods.
          </Text>

          <CodePanel
            language="typescript"
            title="Bound method basics"
            snippetName="basicExample"
            folder="BoundMethods"
            ts
          />
        </Section>

        <Section title="Use in event listeners">
          <Text textStyle="body">
            Bound methods can be passed directly to DOM or React event listeners. For parameterized
            events, place the parameter on the element as <Code>data-id</Code> (or any{' '}
            <Code>data-*</Code> parameters) and read it from
            <Code>event.currentTarget.dataset</Code>.
          </Text>

          <CodePanel
            language="tsx"
            title="Parameterized click handler"
            snippetName="eventExample"
            folder="BoundMethods"
          />
        </Section>

        <Section title="Form field passthrough">
          <Text textStyle="body">
            The same pattern works for forms. The input carries the field name; the bound method
            reads the field name and current value from the event target.
          </Text>
          <CodePanel
            language="tsx"
            title="Parameterized input handler"
            snippetName="inputExample"
            folder="BoundMethods"
          />
          <Text textStyle="body">
            For those who don't already know: if you pass a lambda into a React sub-component, every
            time it is rendered it will detect a new input parameter and re-render itself and any
            sub-components that it includes. Even if you memoize the component, it will perceive
            that its input has altered and re-render itself. Callbacks or external functions do not
            have this problem - but wrapping every passthrough in a callback creates expense that
            using pre-bound methods obviates.
          </Text>
        </Section>

        <Section title="Rules">
          <List spacing={3} styleType="disc" pl={5}>
            <ListItem>Use normal class methods. Arrow-function fields are not rebound.</ListItem>
            <ListItem>
              Use <Code>$bound</Code> in JSX when passing a method reference.
            </ListItem>
            <ListItem>
              Use <Code>data-id</Code> or another <Code>data-*</Code> field when the handler needs
              row, field, or item context.
            </ListItem>
          </List>
        </Section>
      </VStack>
    </Container>
  );
};

export default BoundMethods;
