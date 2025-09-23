import React from 'react';
import { Box, Heading, VStack, VStackProps } from '@chakra-ui/react';

interface TradeoffListProps extends Omit<VStackProps, 'title'> {
  title?: string;
  children: React.ReactNode;
}

/**
 * TradeoffList - Container for trade-offs and considerations
 * 
 * Provides consistent styling for trade-offs with:
 * - Orange color scheme
 * - Warning emoji
 * - Proper spacing and alignment
 */
const TradeoffList: React.FC<TradeoffListProps> = ({ 
  title = "⚠️ Trade-offs", 
  children, 
  ...props 
}) => {
  return (
    <Box>
      <Heading size="md" mb={3} color="orange.600">
        {title}
      </Heading>
      <VStack spacing={3} align="stretch" {...props}>
        {children}
      </VStack>
    </Box>
  );
};

export default TradeoffList;
