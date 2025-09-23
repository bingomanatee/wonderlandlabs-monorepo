import React, { useEffect } from 'react';
import { Box, Tab, TabList, TabPanels, Tabs, useColorModeValue } from '@chakra-ui/react';
import type { CodeTab } from '../storeFactories/codeTabsStoreFactory.ts';
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

  // Simple state for active tab index - no need for complex store
  const [activeIndex, setActiveIndex] = React.useState(defaultIndex);

  // Highlight code when active tab changes
  useEffect(() => {
    // Small delay to ensure DOM is updated
    setTimeout(() => Prism.highlightAll(), 10);
  }, [activeIndex]);

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
        onChange={setActiveIndex}
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
            </Tab>
          ))}
        </TabList>
        <TabPanels mt={0}>
          {tabs.map((tab, index) => (
            <SingleTabPanel key={index} tab={tab} tabIndex={index} />
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CodeTabs;
