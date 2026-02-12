import React from 'react';
import { Box, Code, Container, Heading, List, ListItem, Text, VStack } from '@chakra-ui/react';
import Section from '@/components/Section';

const Changelog: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading variant="page">Changelog</Heading>
          <Text textStyle="hero">
            Version history for Forestry 4, including major API and behavior changes.
          </Text>
        </Box>

        <Section title="4.0" pt={3}>
          <List spacing={2} styleType="disc" pl={5}>
            <ListItem>Redesigned Forestry with a slimmer profile.</ListItem>
            <ListItem>Removed the separate &quot;context&quot; forest pattern.</ListItem>
            <ListItem>Moved to one base class for all value types.</ListItem>
          </List>
        </Section>

        <Section title="4.1" pt={3}>
          <List spacing={2} styleType="disc" pl={5}>
            <ListItem>
              Refactored to class-first usage with class methods instead of the older{' '}
              <Code>$ / act</Code> style.
            </ListItem>
            <ListItem>Improved type safety and simplified store authoring.</ListItem>
          </List>
        </Section>

        <Section title="4.1.2 - 4.1.4" pt={3}>
          <List spacing={2} styleType="disc" pl={5}>
            <ListItem>
              Consolidated classes to a single base class: <Code>Forest</Code>.
            </ListItem>
            <ListItem>
              Prefixed core Forestry methods with <Code>$</Code> to reduce custom-method
              collisions.
            </ListItem>
            <ListItem>
              Kept RxJS-style subject fields (<Code>value</Code>, <Code>next</Code>,{' '}
              <Code>complete</Code>, etc.) unprefixed.
            </ListItem>
          </List>
        </Section>

        <Section title="4.1.5 - 4.1.6" pt={3}>
          <List spacing={2} styleType="disc" pl={5}>
            <ListItem>
              Added <Code>.$</Code> as a bound mirror of class methods for easier React usage.
            </ListItem>
          </List>
        </Section>

        <Section title="4.1.7 - 4.1.8" pt={3}>
          <List spacing={2} styleType="disc" pl={5}>
            <ListItem>Fixed typing issues and improved .d.ts exposure.</ListItem>
          </List>
        </Section>

        <Section title="4.1.9" pt={3}>
          <List spacing={2} styleType="disc" pl={5}>
            <ListItem>
              Added rest params on branching call: <Code>$branch(path, params, ...rest)</Code>.
            </ListItem>
          </List>
        </Section>

        <Section title="4.1.12" pt={3}>
          <List spacing={2} styleType="disc" pl={5}>
            <ListItem>
              Attempted to simplify subject updates to resolve a client bug by reading directly
              from current store content rather than relying on <Code>getPath</Code> during that
              flow.
            </ListItem>
            <ListItem>The bug persisted and likely involves map indexing.</ListItem>
          </List>
        </Section>

        <Section title="4.1.13 - 4.1.14" pt={3}>
          <List spacing={2} styleType="disc" pl={5}>
            <ListItem>
              Added <Code>$branches</Code> / <Code>$br</Code> registry to keep referential
              child-branch instances.
            </ListItem>
            <ListItem>
              Added <Code>branchParams</Code> constructor option to define per-path defaults for
              branches, including <Code>subclass</Code>, <Code>schema</Code>, <Code>prep</Code>,
              and other branch options.
            </ListItem>
            <ListItem>
              <Code>&apos;*&apos;</Code> in <Code>branchParams</Code> acts as wildcard defaults for
              unresolved paths.
            </ListItem>
            <ListItem>
              <Code>branchClasses</Code> remains supported as legacy shorthand for subclass
              defaults.
            </ListItem>
            <ListItem>
              <Code>$br.$get(path)</Code> lazy-creates a branch when no instance exists and the
              parent path value is defined.
            </ListItem>
            <ListItem>
              <Code>$br.$add(path, params)</Code> explicitly creates a branch: throws when a branch
              already exists at the path, and throws when the parent path value is{' '}
              <Code>undefined</Code>.
            </ListItem>
            <ListItem>
              <Code>$br.get(pathKey)</Code> is lookup-only (no lazy creation).
            </ListItem>
            <ListItem>
              <Code>$br.delete(path)</Code> completes and ejects a branch instance from the
              registry.
            </ListItem>
            <ListItem>
              Removed overloaded helpers <Code>$getBranch</Code> and <Code>$removeBranch</Code>;
              use <Code>$br.get</Code> and <Code>$br.delete</Code>.
            </ListItem>
          </List>
        </Section>
      </VStack>
    </Container>
  );
};

export default Changelog;
