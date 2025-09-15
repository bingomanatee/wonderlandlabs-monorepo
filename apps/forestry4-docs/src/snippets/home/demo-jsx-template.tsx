// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/demo-jsx-template.tsx
// Description: Demo JSX template for home page live demo
// Last synced: Sun Sep 14 22:42:19 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

<Box p={6} bg="gray.100" borderRadius="md" textAlign="center">
  <Text fontSize="3xl" fontWeight="bold" color="forest.600" mb={4}>
    {count}
  </Text>
  <HStack spacing={4} justify="center">
    <Button colorScheme="forest" onClick={handleIncrement}>
      +1
    </Button>
    <Button variant="outline" onClick={handleDecrement}>
      -1
    </Button>
    <Button colorScheme="red" variant="outline" onClick={handleReset}>
      Reset
    </Button>
  </HStack>
</Box>
