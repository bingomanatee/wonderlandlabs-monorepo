import React, { useState, useRef, useEffect } from 'react';
import { Box, Text, useColorModeValue, Code, Button, Collapse, Flex, IconButton, useToast } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';

type CodeBlockProps = {
  title?: string;
  language: string;
  code?: string;
  children?: React.ReactNode;
};

const CodeBlock: React.FC<CodeBlockProps> = ({ title, language, code, children }) => {
  const bg = useColorModeValue('gray.900', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Use children if provided, otherwise fall back to code prop
  const content = children ?? code ?? '';

  // Copy to clipboard function
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.toString());
      toast({
        title: 'Copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Check if content needs expansion after render
  useEffect(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      const clientHeight = contentRef.current.clientHeight;
      setNeedsExpansion(scrollHeight > clientHeight);
    }
  }, [content]);

  return (
    <Box
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      width="full"
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
      <Box position="relative">
        {/* Copy button floating in upper right */}
        <IconButton
          aria-label="Copy code"
          icon={<CopyIcon />}
          size="sm"
          position="absolute"
          top={2}
          right={2}
          zIndex={1}
          colorScheme="gray"
          variant="ghost"
          color="gray.400"
          _hover={{ color: 'white', bg: 'gray.700' }}
          onClick={handleCopy}
        />

        <Box
          ref={contentRef}
          as="pre"
          bg={bg}
          color="white"
          p={4}
          overflow="auto"
          fontSize="sm"
          fontFamily="mono"
          lineHeight="1.5"
          maxHeight={isExpanded ? 'none' : '300px'}
          transition="max-height 0.3s ease"
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
            {children ?? code}
          </Code>
        </Box>

        {needsExpansion && (
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg={isExpanded ? 'transparent' : `linear-gradient(transparent, ${bg})`}
            m={6}
          >
            <Flex direction="row" justify="flex-end">
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={() => setIsExpanded(!isExpanded)}
                bg={bg}
                color="white"
                borderColor="blue.400"
                _hover={{ bg: 'blue.600' }}
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </Button>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CodeBlock;
