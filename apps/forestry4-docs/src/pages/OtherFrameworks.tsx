import React from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import CodeTabs from '../components/CodeTabs.tsx';
import PageTitle from '../components/PageTitle';
import Section from '../components/Section';
import { DoDont, DoList, DoItem, DontList, DontItem } from '../components/DoDont';

const OtherFrameworks: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <PageTitle>Other Frameworks</PageTitle>
      <VStack layerStyle="section" spacing={8}>
        {/* Header */}
        <Box textAlign="center">
          <Text textStyle="hero">
            Forestry 4 is framework-agnostic. Use it with Vue, Angular, Express, or any JavaScript
            environment.
          </Text>
        </Box>

        <Section title="general Principle: Stores are Observables">
          <Text textStyle="body">
            Stores are for all practial purposes decorated RxJS BehaviorSubjects; so in general any
            use cases for RxJS are de facto adaption patterns for Forest based stores. The only
            catches are how class methods are presented and they can either be accessed straight off
            the store or adapted as in with the vue example.
          </Text>
        </Section>
        {/* Vue Integration */}
        <Section title="Vue.js Integration">
          <Text mb={4}>
            Forestry integrates seamlessly with Vue's reactivity system. Use stores in computed
            properties and watch for changes with RxJS subscriptions.
          </Text>

          <CodeTabs
            tabs={[
              {
                label: 'Vue Store Setup',
                language: 'typescript',
                snippet: 'vueStoreSetup',
                folder: 'OtherFrameworks',
              },
              {
                label: 'Vue Component',
                language: 'html',
                snippet: 'vueComponentExample',
                folder: 'OtherFrameworks',
              },
              {
                label: 'Composition API',
                language: 'typescript',
                snippet: 'vueCompositionApi',
                folder: 'OtherFrameworks',
              },
            ]}
          />
        </Section>

        {/* Angular Integration */}
        <Section title="Angular Integration">
          <Text mb={4}>
            Use Forestry stores as Angular services with dependency injection. Perfect for state
            management across components and services.
          </Text>

          <CodeTabs
            tabs={[
              {
                label: 'Angular Service',
                language: 'typescript',
                snippet: 'angularService',
                folder: 'OtherFrameworks',
              },
              {
                label: 'Angular Component',
                language: 'typescript',
                snippet: 'angularComponent',
                folder: 'OtherFrameworks',
              },
              {
                label: 'Injectable Store',
                language: 'typescript',
                snippet: 'angularInjectableStore',
                folder: 'OtherFrameworks',
              },
            ]}
          />
        </Section>

        {/* Express/Node.js Integration */}
        <Section title="Express/Node.js Integration">
          <Text mb={4}>
            Use Forestry for server-side state management, caching, and business logic. Perfect for
            API state, session management, and data validation.
          </Text>

          <CodeTabs
            tabs={[
              {
                label: 'Express Middleware',
                language: 'typescript',
                snippet: 'expressMiddleware',
                folder: 'OtherFrameworks',
              },
              {
                label: 'API Route Handler',
                language: 'typescript',
                snippet: 'expressRouteHandler',
                folder: 'OtherFrameworks',
              },
              {
                label: 'Session Store',
                language: 'typescript',
                snippet: 'expressSessionStore',
                folder: 'OtherFrameworks',
              },
            ]}
          />
        </Section>

        {/* Vanilla JavaScript */}
        <Section title="Vanilla JavaScript">
          <Text mb={4}>
            Forestry works perfectly in vanilla JavaScript environments. No framework required! Fans
            of Backbone will recognize a log of whats going on here.
          </Text>

          <CodeTabs
            tabs={[
              {
                label: 'Basic Usage',
                language: 'javascript',
                snippet: 'vanillaBasic',
                folder: 'OtherFrameworks',
              },
              {
                label: 'DOM Integration',
                language: 'javascript',
                snippet: 'vanillaDom',
                folder: 'OtherFrameworks',
              },
            ]}
          />
        </Section>
      </VStack>
    </Container>
  );
};

export default OtherFrameworks;
