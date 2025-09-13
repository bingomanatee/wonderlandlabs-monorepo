import React from 'react'
import { Container, Heading, Text, Box, Badge } from '@chakra-ui/react'

const APIReference: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box>
        <Heading size="xl" mb={4}>
          API Reference
          <Badge ml={3} colorScheme="blue">Reference</Badge>
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Complete API documentation for all Forestry 4 methods and properties.
        </Text>
        <Text mt={4} color="gray.500">
          This page is under construction. Coming soon!
        </Text>
      </Box>
    </Container>
  )
}

export default APIReference
