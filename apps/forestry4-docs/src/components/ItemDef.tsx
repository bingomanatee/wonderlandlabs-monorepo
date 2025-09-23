import React, { useEffect } from 'react';
import { Box, Code, Heading, Text } from '@chakra-ui/react';
import CodePanel from './CodePanel';

interface ItemDefProps {
  /** The method signature or parameter name */
  title: string;
  /** The description text */
  children: React.ReactNode;
  /** Optional code example (inline) */
  code?: string;
  /** Optional snippet name to load code from file */
  snippetName?: string;
  /** Folder for snippet (when using snippetName) */
  snippetFolder?: string;
  /** Language for code syntax highlighting */
  language?: string;
  /** Optional code example title */
  codeTitle?: string;
  /** Size of the title heading */
  titleSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to render title as code (for parameters) or as heading (for methods) */
  titleAsCode?: boolean;
  /** Code color scheme when titleAsCode is true */
  codeColorScheme?: string;
  /** Whether the snippet file has .ts extension instead of .tsx.txt */
  ts?: boolean;
}

const ItemDef: React.FC<ItemDefProps> = ({
  title,
  children,
  code,
  snippetName,
  snippetFolder,
  language = 'typescript',
  codeTitle,
  titleSize = 'sm',
  titleAsCode = false,
  codeColorScheme = '',
}) => {
  // Determine if we should show code (either inline or from snippet)
  const hasCode = code || snippetName;

  // Trigger syntax highlighting after component mounts/updates
  useEffect(() => {
    if (hasCode && typeof window !== 'undefined' && (window as any).Prism) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        (window as any).Prism.highlightAll();
      }, 100);
    }
  }, [hasCode, snippetName, code]);

  return (
    <Box>
      <Heading size={titleSize} layerStyle="methodSignature">
        {titleAsCode ? (
          <Code fontSize="sm" colorScheme={codeColorScheme} mb={1}>
            {title}
          </Code>
        ) : (
          title
        )}
      </Heading>

      <Text
        textStyle="body"
        fontSize={titleAsCode ? 'sm' : undefined}
        color={titleAsCode ? 'gray.600' : undefined}
        mt={titleAsCode ? 1 : 3}
      >
        {children}
      </Text>

      {hasCode && (
        <Box mt={4}>
          {snippetName ? (
            // Use CodePanel for external files
            <CodePanel
              title={codeTitle}
              language={language}
              snippetName={snippetName}
              folder={snippetFolder}
            />
          ) : (
            // Use inline CodePanel
            <CodePanel language={language} title={codeTitle}>
              {code}
            </CodePanel>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ItemDef;
