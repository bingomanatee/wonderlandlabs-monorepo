import React, { useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Code,
  Flex,
  IconButton,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import useForestryLocal from '../hooks/useForestryLocal';
import { createCodePanelStore, CodePanelState } from '../storeFactories/codePanelStoreFactory';

export interface CodePanelProps {
  // Core required props
  language: string;

  // Snippet loading (primary use case)
  snippetName?: string;
  folder?: string;
  ts?: boolean; // Use .ts extension instead of .tsx.txt

  // Alternative content (fallback)
  content?: string;
  children?: React.ReactNode;

  // Optional customization
  title?: string;
  maxHeight?: string;

  // Styling
  containerProps?: any;
  codeProps?: any;
}

const CodePanel: React.FC<CodePanelProps> = ({
  language,
  snippetName,
  folder,
  ts,
  content,
  children,
  title,
  containerProps = {},
  codeProps = {},
}) => {
  const bg = useColorModeValue('gray.900', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  // Create the unified store configuration
  const storeConfig = {
    language,
    snippetName,
    folder,
    title,
    content: content || children?.toString() || '',
    children,
  };

  // Create Forestry store for state management
  const [state, store] = useForestryLocal<CodePanelState>(createCodePanelStore, storeConfig);

  const contentRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLElement>(null);

  // Set refs in store for DOM operations
  useEffect(() => {
    store.setRefs(contentRef, codeRef);
  }, [store]);

  // Load snippet if specified
  useEffect(() => {
    if (snippetName) {
      store.loadSnippet(snippetName, folder, ts);
    }
  }, [snippetName, folder, ts, store]);

  // Handle copy
  const handleCopy = async () => {
    const result = await store.copyToClipboard();
    toast({
      title: result.message,
      status: result.success ? 'success' : 'error',
      duration: 2000,
      isClosable: true,
    });
  };

  // DOM observation effect
  useEffect(() => {
    if (state.enableDOMObservation) {
      store.startDOMObservation();
    } else {
      // Simple check for non-DOM observation mode
      store.checkExpansionNeeds();
    }
    const t = setTimeout(() => {
      store.checkExpansionWithHighlight();
    }, 800);
    return () => {
      clearTimeout(t);
      store.stopDOMObservation();
    };
  }, [state.enableDOMObservation, store, store.displayContent]);

  return (
    <Box
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      width="full"
      overflow="hidden"
      my={4}
      {...containerProps}
    >
      {(state.title || title) && (
        <Box bg="gray.100" px={4} py={2} borderBottom="1px" borderColor={borderColor}>
          <Text fontSize="sm" fontWeight="medium">
            {title || state.title}
          </Text>
        </Box>
      )}

      <Box position="relative">
        {/* Control Panel */}
        {(state.showImportsToggle || state.showCopyButton) && (
          <Flex
            position="absolute"
            top={2}
            right={8}
            zIndex={10}
            align="center"
            gap={2}
            bg="blackAlpha.300"
            px={state.showImportsToggle ? 4 : 2}
            py={1}
            borderRadius="md"
            backdropFilter="blur(4px)"
          >
            {/* Imports toggle */}
            {store.shouldShowImportsToggle && (
              <Flex align="center" gap={1}>
                <input
                  type="checkbox"
                  checked={state.isImportsExpanded}
                  onChange={store.$.toggleImports}
                  style={{
                    width: '12px',
                    height: '12px',
                    accentColor: '#3182ce',
                  }}
                />
                <Text
                  fontSize="xs"
                  color="gray.300"
                  cursor="pointer"
                  userSelect="none"
                  onClick={store.$.toggleImports}
                >
                  show imports
                </Text>
              </Flex>
            )}

            {/* Copy button */}
            {state.showCopyButton && (
              <IconButton
                aria-label="Copy code"
                icon={<CopyIcon />}
                size="xs"
                colorScheme="gray"
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'white', bg: 'gray.600' }}
                onClick={handleCopy}
              />
            )}
          </Flex>
        )}

        {/* Code Content */}
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
          maxHeight={state.isExpanded ? 'none' : state.maxHeight}
          transition="max-height 0.3s ease"
          {...codeProps}
        >
          <Code
            as="code"
            className={`language-${state.language === 'tsx' ? 'typescript' : state.language}`}
            bg="transparent"
            color="inherit"
            p={0}
            fontSize="inherit"
            fontFamily="inherit"
            whiteSpace="pre"
            ref={codeRef}
          >
            {children ?? store.displayContent}
          </Code>
        </Box>

        {/* Expand/Collapse Button */}
        {state.showExpandButton && (state.needsExpansion || state.isExpanded) && (
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg={state.isExpanded ? 'transparent' : `linear-gradient(transparent, ${bg})`}
            p={4}
          >
            <Flex
              direction="row"
              justify="flex-end"
              pr={state.showImportsToggle || state.showCopyButton ? 8 : 0}
            >
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={store.$.toggleExpansion}
                bg={bg}
                color="white"
                borderColor="blue.400"
                _hover={{ bg: 'blue.600' }}
              >
                {state.isExpanded ? 'Show Less' : 'Show More'}
              </Button>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CodePanel;
