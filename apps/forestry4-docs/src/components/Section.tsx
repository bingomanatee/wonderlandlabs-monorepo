import React from 'react';
import { Card, CardBody, CardBodyProps, Heading, VStack } from '@chakra-ui/react';

interface SectionProps extends CardBodyProps {
  children: React.ReactNode;
  title?: string;
  titleSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  spacing?: number;
  noVStack?: boolean; // Opt-out of automatic VStack wrapping
}

const Section: React.FC<SectionProps> = ({
  children,
  title,
  titleSize = 'lg',
  spacing = 6,
  noVStack = false,
  ...props
}) => {
  const header = title ? (
    <Heading textAlign="center" size={titleSize}>
      {title}
    </Heading>
  ) : (
    ''
  );

  return (
    <Card width="full" mb={3}>
      <CardBody {...props}>
        {header}
        {noVStack ? (
          children
        ) : (
          <VStack spacing={spacing} align="stretch">
            {children}
          </VStack>
        )}
      </CardBody>
    </Card>
  );
};

export default Section;
