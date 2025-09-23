import React from 'react';
import { Box, Heading, VStack, VStackProps } from '@chakra-ui/react';

interface DontListProps extends Omit<VStackProps, 'title'> {
  title?: string;
  children: React.ReactNode;
}

/**
 * DontList - Container for "Don't" warnings
 * 
 * Provides consistent styling for negative warnings with:
 * - Red color scheme
 * - X mark emoji
 * - Proper spacing and alignment
 */
const DontList: React.FC<DontListProps> = ({ 
  title = "❌ Things that won't work", 
  children, 
  ...props 
}) => {
  return (
    <Box>
      <Heading size="md" mb={3} color="red.600">
        {title}
      </Heading>
      <VStack spacing={3} align="stretch" {...props}>
        {children}
      </VStack>
    </Box>
  );
};

export default DontList;
