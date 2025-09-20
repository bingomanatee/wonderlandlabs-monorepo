import React, { useEffect, useRef } from 'react';
import { Box, Tab, TabList, Tabs, TabPanels, useColorModeValue } from '@chakra-ui/react';
import useForestryLocal from '../hooks/useForestryLocal.ts';
import {
  CodeTab,
  CodeTabsState,
  createCodeTabsStore,
} from '../storeFactories/codeTabsStoreFactory.ts';
import SingleTabPanel from './SingleTabPanel.tsx';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';

interface CodeTabsProps {
  tabs: CodeTab[];
  defaultIndex?: number;
}

const CodeTabs: React.FC<CodeTabsProps> = ({ tabs, defaultIndex = 0 }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Use Forest store with factory function - useForestryLocal returns [value, store]
  const [storeValue, store] = useForestryLocal<CodeTabsState>(
    createCodeTabsStore,
    tabs,
    defaultIndex
  );
  const { tabContents, activeIndex, loading } = storeValue;

  // Load snippets on mount or when tabs change
  useEffect(() => {
    store.loadAllSnippets(tabs);
  }, [tabs, store]);

  // Check if content needs expansion after render
  useEffect(() => {
    store.checkExpansionNeeds(contentRefs.current);
  }, [tabContents, store]);

  // Highlight code when content changes
  useEffect(() => {
    if (!loading) {
      // Small delay to ensure DOM is updated
      setTimeout(() => Prism.highlightAll(), 10);
    }
  }, [tabContents, loading]);

  return (
    <Box
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
      my={4}
      width="full"
    >
      <Tabs
        index={activeIndex}
        onChange={(index) => store.setActiveIndex(index)}
        variant="enclosed"
      >
        <TabList bg="gray.100" borderBottom="1px" borderColor={borderColor}>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              fontSize="sm"
              fontWeight="medium"
              _selected={{
                bg: 'black',
                color: 'white',
                borderBottomColor: 'black',
              }}
            >
              {tab.label}
              {tabContents[index]?.error && (
                <Box as="span" color="red.400" fontSize="xs" ml={2}>
                  ⚠️
                </Box>
              )}
            </Tab>
          ))}
        </TabList>
        <TabPanels mt={0}>
          {tabs.map((tab, index) => (
            <SingleTabPanel key={index} tab={tab} tabIndex={index} store={store} />
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CodeTabs;
