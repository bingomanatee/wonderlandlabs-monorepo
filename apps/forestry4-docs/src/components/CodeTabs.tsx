import React, { useEffect } from 'react'
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
  useColorModeValue,
} from '@chakra-ui/react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'

interface CodeTab {
  label: string
  language: string
  code: string
}

interface CodeTabsProps {
  tabs: CodeTab[]
  defaultIndex?: number
}

const CodeTabs: React.FC<CodeTabsProps> = ({ tabs, defaultIndex = 0 }) => {
  const bg = useColorModeValue('gray.900', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    Prism.highlightAll()
  }, [tabs])

  return (
    <Box
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
      my={4}
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
                  {tab.code}
                </Code>
              </Box>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  )
}

export default CodeTabs
