import React from 'react';
import { Container, Heading, Text, Box, VStack, Divider } from '@chakra-ui/react';
import BenefitsSection from '../components/WhyForestry/BenefitsSection';
import ComparisonSection from '../components/WhyForestry/ComparisonSection';
import LiveDemo from '../components/WhyForestry/LiveDemo';

const WhyForestry: React.FC = () => {
  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={12} align="stretch">
        {/* Hero Section */}
        <Box textAlign="center">
          <Heading size="3xl" mb={6}>
            Why Forestry?
          </Heading>
          <Text textStyle="hero">
            Forestry is a next-generation state management library that combines the power of RxJS
            reactivity with TypeScript safety and an intuitive developer experience.
          </Text>
        </Box>

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

        <Text>the TLDR of the above; </Text>

        <Divider />

        {/* Live Demo Section */}
        <Box>
          <Heading size="xl" mb={6} textAlign="center">
            Try Forestry Live
          </Heading>
          <LiveDemo />
        </Box>

        <Divider />

        {/* Comparison Section */}
        <ComparisonSection />
      </VStack>
    </Container>
  );
};

export default WhyForestry;
