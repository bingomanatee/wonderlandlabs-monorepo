import React from 'react'
import { Container, Heading, Text, Box } from '@chakra-ui/react'

const Transactions: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box>
        <Heading size="xl" mb={4}>
          Transaction System
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Deep dive into Forestry 4's advanced transaction system with rollback support and nested transactions.
        </Text>
        <Text mt={4} color="gray.500">
          This page is under construction. Coming soon!
        </Text>
      </Box>
    </Container>
  )
}

export default Transactions
