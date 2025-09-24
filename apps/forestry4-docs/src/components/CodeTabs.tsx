import React, { useEffect } from 'react';
import { Box, Tab, TabList, TabPanels, Tabs, useColorModeValue } from '@chakra-ui/react';
import type { CodeTab } from '../storeFactories/codeTabsStoreFactory.ts';
import SingleTabPanel from './SingleTabPanel.tsx';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-xml-doc';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-docker';

// Vue support (Vue files are treated as markup with embedded JS/CSS)
// Load dependencies for Vue syntax highlighting
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css-extras';
import 'prismjs/components/prism-scss';

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
