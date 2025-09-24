import React from 'react';
import { SimpleGrid, SimpleGridProps } from '@chakra-ui/react';
import Section from '../Section';

interface DoDontProps extends SimpleGridProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * DoDont - Container component for Do's and Don'ts sections
 *
 * Provides a Section wrapper with responsive grid layout for side-by-side Do and Don't lists.
 * Automatically handles responsive breakpoints for mobile/desktop layouts.
 * Includes Section component for consistent styling and spacing.
 */
const DoDont: React.FC<DoDontProps> = ({ children, title, ...props }) => {
  return (
    <Section title={title}>
      <SimpleGrid
        columns={{ base: 1, lg: 2 }}
        spacing={6}
        {...props}
      >
        {children}
      </SimpleGrid>
    </Section>
  );
};

export default DoDont;
