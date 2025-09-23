import React from 'react';
import { Box, Container, Divider, Heading, Text, VStack } from '@chakra-ui/react';
import BenefitsSection from '../components/WhyForestry/BenefitsSection';
import ComparisonSection from '../components/WhyForestry/ComparisonSection';
import Section from '@/components/Section.tsx';
import CodeTabs from '@/components/CodeTabs.tsx';
import TodoAppDemo from '@/components/ReactIntegration/TodoAppDemo.tsx';

const WhyForestry: React.FC = () => {
  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={12} align="stretch">
        <Box textAlign="center">
          <Heading size="3xl" mb={6}>
            Why Forestry?
          </Heading>
          <Text textStyle="hero">
            Forestry is a next-generation state management library that combines the power of RxJS
            reactivity with TypeScript safety and an intuitive developer experience.
          </Text>
        </Box>
        {/* Comparison Section */}
        <ComparisonSection />
        {/* Hero Section */}

        <Divider />

        {/* Benefits Section */}
        <BenefitsSection />
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/bGzanfKVFeU?si=XVsdcSKOh3CcEYFm"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>

        <Text>Why useEffect is not a panacea</Text>

        <Divider />

        {/* Live Demo Section */}
        <Section title="Try Forestry Live">
          <TodoAppDemo />
        </Section>

        {/* Code Structure */}
        <Section title="Implementation">
          <CodeTabs
            tabs={[
              {
                label: 'Store Structure',
                language: 'typescript',
                snippet: 'createTodoStore',
              },
              {
                label: 'Component Usage',
                language: 'tsx',
                snippet: 'TodoApp',
              },
            ]}
          />
        </Section>
      </VStack>
    </Container>
  );
};

export default WhyForestry;
