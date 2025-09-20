import React, { ReactNode } from 'react';
import { Badge, Box, Heading, Text, VStack } from '@chakra-ui/react';

interface PageTitleProps {
  title?: string;
  subtitle?: string;
  badge?: {
    text: string;
    colorScheme?: string;
  };
  centered?: boolean;
  maxWidth?: string;
  children?: ReactNode;
}

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  badge,
  centered = true,
  maxWidth = '2xl',
  children,
}) => {
  if (!(title || children)) {
    return '';
  }
  const badgeText = typeof badge === 'string' ? badge : badge?.text;
  const badgeColor = typeof badge === 'object' ? (badge?.colorScheme ?? 'green') : 'green';
  return (
    <Box textAlign={centered ? 'center' : 'left'} mb={8}>
      <VStack spacing={4} align={centered ? 'center' : 'flex-start'}>
        <Box>
          <Heading variant="page" mb={badge ? 3 : 0}>
            {title ?? children}
            {badgeText && (
              <Badge ml={3} colorScheme={badgeColor} variant="subtle">
                {badgeText}
              </Badge>
            )}
          </Heading>
        </Box>

        {subtitle && (
          <Text
            fontSize="lg"
            color="gray.600"
            maxW={maxWidth}
            textAlign={centered ? 'center' : 'left'}
          >
            {subtitle}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default PageTitle;
