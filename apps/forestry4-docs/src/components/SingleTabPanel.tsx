import React from 'react';
import { TabPanel } from '@chakra-ui/react';
import type { CodeTab } from '../storeFactories/codeTabsStoreFactory.ts';
import CodePanel from './CodePanel.tsx';

interface SingleTabPanelProps {
  tab: CodeTab;
  tabIndex: number;
}

const SingleTabPanel: React.FC<SingleTabPanelProps> = ({ tab }) => {
  return (
    <TabPanel p={0} mt={0}>
      <CodePanel
        language={tab.language}
        snippetName={tab.snippet}
        folder={tab.folder}
        content={tab.code} // Fallback for inline code
        containerProps={{
          border: 'none',
          borderRadius: 0,
          my: 0,
        }}
        codeProps={{
          bg: 'gray.700',
        }}
      />
    </TabPanel>
  );
};

export default SingleTabPanel;
