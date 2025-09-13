import React from 'react'
import { Container, Heading, Text, Box } from '@chakra-ui/react'

const Examples: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box>
        <Heading size="xl" mb={4}>
          Practical Examples
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Real-world examples demonstrating Forestry 4's capabilities in various scenarios.
        </Text>
        <Text mt={4} color="gray.500">
          This page is under construction. Coming soon!
        </Text>
      </Box>
    </Container>
  )
}

export default Examples
