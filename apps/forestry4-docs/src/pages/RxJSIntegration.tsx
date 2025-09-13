import React from 'react'
import { Container, Heading, Text, Box, Badge } from '@chakra-ui/react'

const RxJSIntegration: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box>
        <Heading size="xl" mb={4}>
          RxJS Integration
          <Badge ml={3} colorScheme="purple">Power Tool</Badge>
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Leverage RxJS operators and reactive programming patterns with Forestry 4.
        </Text>
        <Text mt={4} color="gray.500">
          This page is under construction. Coming soon!
        </Text>
      </Box>
    </Container>
  )
}

export default RxJSIntegration
