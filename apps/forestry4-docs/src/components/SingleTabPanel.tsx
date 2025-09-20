import React, { useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Code,
  Flex,
  IconButton,
  TabPanel,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import { CodeTab } from './CodeTabs.tsx';
import { CodeTabsForest } from '../storeFactories/codeTabsStoreFactory.ts';
import useForestBranch from '../hooks/useForestBranch.ts';
import { SingleTabBranch } from '@/components/branches/SingleTabBranch.ts';
import Prism from 'prismjs';

interface SingleTabPanelProps {
  tab: CodeTab;
  tabIndex: number;
  store: CodeTabsForest;
}

const SingleTabPanel: React.FC<SingleTabPanelProps> = ({ tab, tabIndex, store }) => {
  const bg = useColorModeValue('gray.900', 'gray.800');
  const toast = useToast();

  // Create a ref for the content element - fully localized
  const contentRef = useRef<HTMLDivElement>(null);

  // Create a branch using the specialized subclass config factory
  const [tabContent, tabBranch] = useForestBranch(
    store,
    ['tabContents', tabIndex],
    (tabIndex) => ({
      name: `single-tab-${tabIndex}`,
      subclass: SingleTabBranch,
      tabIndex: tabIndex,
    }),
    tabIndex
  );

  // Use branch subclass for all logic
  const tabBranchInstance = tabBranch as SingleTabBranch;
  const codeRef = useRef(null);
  // Use MutationObserver to detect DOM changes and check expansion needs
  useEffect(() => {
    let resizing = false;
    const checkExpansion = () => {
      if (resizing) {
        return;
      }
      tabBranchInstance.checkExpansionNeeds(contentRef);
      if (codeRef.current) {
        resizing = true;
        Prism.highlightElement(codeRef.current);
        setTimeout(() => {
          resizing = false;
        }, 200);
      }
    };

    // Check immediately
    checkExpansion();

    if (contentRef.current) {
      // Create MutationObserver to watch for DOM changes
      const observer = new MutationObserver(checkExpansion);

      // Observe changes to the content element and its children
      observer.observe(contentRef.current, {
        childList: true, // Watch for added/removed children
        subtree: true, // Watch all descendants
        characterData: true, // Watch for text content changes
        attributes: true, // Watch for attribute changes
        attributeFilter: ['style', 'class'], // Specifically watch style/class changes
      });

      // Also use ResizeObserver if available for size changes
      let resizeObserver: ResizeObserver | null = null;
      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(checkExpansion);
        resizeObserver.observe(contentRef.current);
      }

      return () => {
        observer.disconnect();
        resizeObserver?.disconnect();
      };
    }
  }, [tabBranchInstance, contentRef]);

  // Also check when content changes (fallback)
  useEffect(() => {
    const timer = setTimeout(() => {
      tabBranchInstance.checkExpansionNeeds(contentRef);
    }, 100);

    return () => clearTimeout(timer);
  }, [tabContent?.text, tabContent?.mainContent, tabBranchInstance, contentRef]);

  // Handle copy with toast notifications
  const handleCopyFull = async () => {
    const result = await tabBranchInstance.copyToClipboard();
    toast({
      title: result.message,
      status: result.success ? 'success' : 'error',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <TabPanel p={0} mt={0}>
      <Box position="relative">
        {/* Hidden block with full content for copy operation */}
        <Box display="none" id={`full-content-${tabIndex}`}>
          {tabBranchInstance.displayContent}
        </Box>

        {/* Fixed Control Panel */}
        <Flex
          position="absolute"
          top={2}
          right={8}
          zIndex={10}
          align="center"
          gap={2}
          bg="rgba(0, 0, 0, 0.7)"
          px={4}
          py={1}
          borderRadius="md"
          backdropFilter="blur(4px)"
        >
          {/* Imports toggle checkbox - only show if imports exist */}
          {tabBranchInstance.hasImports && (
            <Flex align="center" gap={1}>
              <input
                type="checkbox"
                id={`imports-${tabIndex}`}
                checked={tabContent.isImportsExpanded}
                onChange={tabBranchInstance.$.toggleImportsExpansion}
                style={{
                  width: '12px',
                  height: '12px',
                  accentColor: '#3182ce',
                }}
              />
              <Text
                as="label"
                htmlFor={`imports-${tabIndex}`}
                fontSize="xs"
                color="gray.300"
                cursor="pointer"
                userSelect="none"
              >
                imports
              </Text>
            </Flex>
          )}

          {/* Copy button */}
          <IconButton
            aria-label="Copy full code"
            icon={<CopyIcon />}
            size="xs"
            colorScheme="gray"
            variant="ghost"
            color="gray.400"
            _hover={{ color: 'white', bg: 'gray.600' }}
            onClick={handleCopyFull}
          />
        </Flex>

        {/* Unified Code Content Area */}
        <Box position="relative">
          <Box
            ref={contentRef}
            as="pre"
            bg="gray.700"
            color="white"
            p={4}
            overflow="auto"
            fontSize="sm"
            fontFamily="mono"
            lineHeight="1.5"
            maxHeight={tabContent.isExpanded ? 'none' : '300px'}
            transition="max-height 0.3s ease"
          >
            <Code
              as="code"
              className={`language-${tab.language === 'tsx' ? 'typescript' : tab.language}`}
              bg="transparent"
              color="inherit"
              p={0}
              fontSize="inherit"
              fontFamily="inherit"
              whiteSpace="pre"
              ref={codeRef}
            >
              {tabContent.isImportsExpanded && tabBranchInstance.hasImports
                ? tabBranchInstance.displayContent
                : tabContent?.mainContent || '// Loading...'}
            </Code>
          </Box>

          {/* Expand/Collapse Button */}
          {(tabContent.needsExpansion || tabContent.isExpanded) && (
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg={tabContent.isExpanded ? 'transparent' : `linear-gradient(transparent, ${bg})`}
              p={4}
            >
              <Flex direction="row" justify="flex-end" pr={8}>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => tabBranchInstance.toggleExpansion()}
                  bg={bg}
                  color="white"
                  borderColor="blue.400"
                  _hover={{ bg: 'blue.600' }}
                >
                  {tabContent.isExpanded ? 'Show Less' : 'Show More'}
                </Button>
              </Flex>
            </Box>
          )}
        </Box>
      </Box>
    </TabPanel>
  );
};

export default SingleTabPanel;
