import React from 'react';
import { Box, Container, Heading, Image, Text, VStack } from '@chakra-ui/react';
import AdvancedFormDemo from '@/components/ValidationSystem/AdvancedFormDemo.tsx';
import ValidationGuide from '@/components/ValidationSystem/ValidationGuide.tsx';
import Section from '@/components/Section.tsx';
import AdvancedFormDemoSource from '@/components/ValidationSystem/AdvancedFormDemoSource.tsx';
import { Link } from 'react-router-dom';

const ValidationSystem: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={4}>
            Validation System
          </Heading>
          <Text textStyle="hero">
            Learn about Forestry 4's comprehensive validation system with practical examples of
            schema validation, business logic tests, and UI state management.
          </Text>
        </Box>

        <Section title="What KIND of Validation/Struture do you want to enforce?">
          <Image src="/img/how-to-limit-values.svg" width="full" mx={8} maxHeight="80vh" />
          <Text textStyle="body">
            Validation is derived from data <i>structure</i> and business <i>rules.</i>
            the nature of the desired form defines how and where you limit, flag or filter your
            input. When you want to accept failures but flag them (as is the case with most form
            input) you have to explode each candidate field into a cluster of value / state / error
            metadata to precsely manage each field entry.
          </Text>
        </Section>

        <Section title="HOW do you want to constrain data?">
          <Image src="/img/how-to-handle-bad-values.svg" width="full" mx={8} maxHeight="80vh" />
          <Text textStyle="body">
            There is usually one of three pattens to how you handle "bad data" - fix it, mark it, or
            reject it. What you do - and when - defines how you want to structure your constraints.
          </Text>
        </Section>
        <Section title="Form Demo">
          <Text textStyle="body">
            Try filling out the form below. Notice how validation provides immediate feedback,
            handles async operations, and manages complex field dependencies. This example is more
            fully parsed <Link to="/examples/form">Here</Link>
          </Text>
          <AdvancedFormDemo />
        </Section>
        <AdvancedFormDemoSource />

        <ValidationGuide />
      </VStack>
    </Container>
  );
};

export default ValidationSystem;
