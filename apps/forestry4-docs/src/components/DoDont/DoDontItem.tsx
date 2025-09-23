import React from 'react';
import { Box, BoxProps, Text } from '@chakra-ui/react';

interface DoDontItemProps extends BoxProps {
  title: string;
  children: React.ReactNode;
  isDont?: boolean;
}

/**
 * DoDontItem - Universal item component for Do's and Don'ts
 *
 * Provides consistent styling for both positive recommendations and warnings with:
 * - Green background for Do's (isDont=false)
 * - Red background for Don'ts (isDont=true)
 * - layerStyle="highlight" for consistent padding and border radius
 * - Inner Box with layerStyle="card" for content spacing
 * - textStyle="body" for titles and textStyle="description" for content
 */
const DoDontItem: React.FC<DoDontItemProps> = ({ title, children, isDont = false, ...props }) => {
  const borderColor = isDont ? 'red.200' : 'green.200';

  return (
    <Box layerStyle="doDontItem" borderColor={borderColor} {...props}>
      <Box layerStyle="card">
        <Text textStyle="body" fontWeight="semibold">
          {title}
        </Text>
        <Text textStyle="description">{children}</Text>
      </Box>
    </Box>
  );
};

export default DoDontItem;
