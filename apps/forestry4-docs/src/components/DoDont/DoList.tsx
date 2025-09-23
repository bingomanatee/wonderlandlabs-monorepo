import React from 'react';
import { Box, Heading, VStack, VStackProps } from '@chakra-ui/react';

interface DoListProps extends Omit<VStackProps, 'title'> {
  title?: string;
  children: React.ReactNode;
}

/**
 * DoList - Container for "Do" recommendations
 * 
 * Provides consistent styling for positive recommendations with:
 * - Green color scheme
 * - Check mark emoji
 * - Proper spacing and alignment
 */
const DoList: React.FC<DoListProps> = ({ 
  title = "✅ Best Practices", 
  children, 
  ...props 
}) => {
  return (
    <Box>
      <Heading size="md" mb={3} color="green.600">
        {title}
      </Heading>
      <VStack spacing={3} align="stretch" {...props}>
        {children}
      </VStack>
    </Box>
  );
};

export default DoList;
