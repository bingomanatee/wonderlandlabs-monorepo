// @ts-nocheck
import { ChakraBaseProvider } from '@chakra-ui/react';
import type { PropsWithChildren } from 'react';
import { theme } from './theme';
import { MDXProvider } from '@mdx-js/react';
import { MARKDOWN_COMPONENTS } from './markdownComponents';

export function Chakra({
  children,
}: PropsWithChildren) {
  return (
    <ChakraBaseProvider theme={theme}>
      <MDXProvider
        components={MARKDOWN_COMPONENTS}
      >
        {children}
      </MDXProvider>
    </ChakraBaseProvider>
  );
}
