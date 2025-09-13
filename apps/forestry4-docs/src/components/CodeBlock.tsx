import React from 'react';
import { Box, Text, useColorModeValue, Code } from '@chakra-ui/react';

type CodeBlockProps = {
  title?: string;
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ title, language, code }) => {
  const bg = useColorModeValue('gray.900', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
      my={4}
    >
      {title && (
        <Box bg="gray.100" px={4} py={2} borderBottom="1px" borderColor={borderColor}>
          <Text fontSize="sm" fontWeight="medium">
            {title}
          </Text>
        </Box>
      )}
      <Box
        as="pre"
        bg={bg}
        color="white"
        p={4}
        overflow="auto"
        fontSize="sm"
        fontFamily="mono"
        lineHeight="1.5"
      >
        <Code
          as="code"
          className={`language-${language}`}
          bg="transparent"
          color="inherit"
          p={0}
          fontSize="inherit"
          fontFamily="inherit"
          whiteSpace="pre"
        >
          {code}
        </Code>
      </Box>
    </Box>
  );
};

export default CodeBlock;
