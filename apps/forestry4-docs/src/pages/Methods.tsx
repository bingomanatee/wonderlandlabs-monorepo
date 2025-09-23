import React from 'react';
import { Box, Container, Heading, Text } from '@chakra-ui/react';

const Methods: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box>
        <Heading size="xl" mb={4}>
          Store Methods
        </Heading>
        <Text textStyle="hero">
          Comprehensive guide to all public methods available on Store instances.
        </Text>
        <Text mt={4} color="gray.500">
          This page is under construction. Coming soon!
        </Text>
      </Box>
    </Container>
  );
};

export default Methods;
