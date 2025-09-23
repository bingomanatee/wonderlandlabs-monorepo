import React from 'react';
import { SimpleGrid, SimpleGridProps } from '@chakra-ui/react';

interface DoDontProps extends SimpleGridProps {
  children: React.ReactNode;
}

/**
 * DoDont - Container component for Do's and Don'ts sections
 * 
 * Provides a responsive grid layout for side-by-side Do and Don't lists.
 * Automatically handles responsive breakpoints for mobile/desktop layouts.
 */
const DoDont: React.FC<DoDontProps> = ({ children, ...props }) => {
  return (
    <SimpleGrid 
      columns={{ base: 1, lg: 2 }} 
      spacing={6} 
      {...props}
    >
      {children}
    </SimpleGrid>
  );
};

export default DoDont;
