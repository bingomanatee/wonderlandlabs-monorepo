import React, { useEffect, useState } from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
  useColorModeValue,
} from '@chakra-ui/react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

interface CodeTab {
  label: string;
  language: string;
  code?: string;
  snippet?: string;
  folder?: string;
}

interface CodeTabsProps {
  tabs: CodeTab[];
  defaultIndex?: number;
}

const CodeTabs: React.FC<CodeTabsProps> = ({ tabs, defaultIndex = 0 }) => {
  const bg = useColorModeValue('gray.900', 'gray.800');
  const [tabContents, setTabContents] = useState<string[]>([]);

  useEffect(() => {
    const loadSnippets = async () => {
      const contents = await Promise.all(
        tabs.map(async (tab) => {
          if (tab.code) {
            return tab.code;
          } else if (tab.snippet) {
            try {
              const path = tab.folder
                ? `/snippets/${tab.folder}/${tab.snippet}.tsx.txt`
                : `/snippets/${tab.snippet}.tsx.txt`;
              const response = await fetch(path);
              if (!response.ok) {
                throw new Error(`Failed to load snippet: ${tab.snippet}`);
              }
              return await response.text();
            } catch (err) {
              return `// Error loading snippet: ${tab.snippet}`;
            }
          }
          return '// No content';
        })
      );
      setTabContents(contents);
    };

    loadSnippets();
  }, [tabs]);
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    Prism.highlightAll();
  }, [tabContents]);

  return (
    <Box
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
      my={4}
      width="full"
    >
      <Tabs defaultIndex={defaultIndex} variant="enclosed">
        <TabList bg="gray.100" borderBottom="1px" borderColor={borderColor}>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              fontSize="sm"
              fontWeight="medium"
              _selected={{
                bg: bg,
                color: 'white',
                borderBottomColor: bg,
              }}
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((tab, index) => (
            <TabPanel key={index} p={0}>
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
                  className={`language-${tab.language}`}
                  bg="transparent"
                  color="inherit"
                  p={0}
                  fontSize="inherit"
                  fontFamily="inherit"
                  whiteSpace="pre"
                >
                  {tabContents[index] || '// Loading...'}
                </Code>
              </Box>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CodeTabs;
