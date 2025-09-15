import React from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  VStack,
} from '@chakra-ui/react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    colorScheme?: string;
  };
  centered?: boolean;
  maxWidth?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  badge,
  centered = true,
  maxWidth = '2xl',
}) => {
  return (
    <Box textAlign={centered ? 'center' : 'left'} mb={8}>
      <VStack spacing={4} align={centered ? 'center' : 'flex-start'}>
        <Box>
          <Heading size="xl" mb={badge ? 3 : 0}>
            {title}
            {badge && (
              <Badge 
                ml={3} 
                colorScheme={badge.colorScheme || 'green'}
                variant="subtle"
              >
                {badge.text}
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
