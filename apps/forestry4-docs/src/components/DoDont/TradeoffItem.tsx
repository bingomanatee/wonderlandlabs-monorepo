import React from 'react';
import { Box, BoxProps, Text } from '@chakra-ui/react';

interface TradeoffItemProps extends BoxProps {
  title: string;
  children: React.ReactNode;
}

/**
 * TradeoffItem - Individual trade-off/consideration item
 *
 * Provides consistent styling for trade-offs and considerations with:
 * - Orange background
 * - layerStyle="highlight" for consistent padding and border radius
 * - Bold title
 * - Description text with textStyle="description"
 */
const TradeoffItem: React.FC<TradeoffItemProps> = ({ title, children, ...props }) => {
  return (
    <Box layerStyle="highlight" bg="orange.50" {...props}>
      <Box layerStyle="card">
        <Text textStyle="body" fontWeight="semibold">{title}</Text>
        <Text textStyle="description">
          {children}
        </Text>
      </Box>
    </Box>
  );
};

export default TradeoffItem;
