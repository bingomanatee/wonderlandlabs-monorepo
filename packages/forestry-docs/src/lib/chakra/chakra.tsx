import { ChakraBaseProvider, Text, Box } from '@chakra-ui/react';
import type { PropsWithChildren } from 'react';
import { theme } from './theme';
import { MDXProvider } from '@mdx-js/react';

type AnyProps = Record<string, any>;

const COMPONENTS = {
  p: (props: AnyProps) => <Text textStyle="mdParagraph" as="p" {...props} />,
  pre: (props: AnyProps) => (
    <Box
      layerStyle="mdCode"
      style={{
        backgroundColor: 'rgba(0,0,0,0.15)',
        borderImageSource: 'url("/frames/code-frame.svg")',
        borderImageSlice: '5 5 5 10',
        borderImageWidth: '2.5px 2.5px 2.5px 5px',
        borderImageOutset: '0px 0px 0px 0px',
        borderImageRepeat: 'stretch stretch',
        borderStyle: 'solid',
      }}
    >
      {props.children}
    </Box>
  ),
  code: (props: AnyProps) => <Text as="span" textStyle="mdVariable" {...props} />,
};

export function Chakra({ children }: PropsWithChildren) {
  return (
    <ChakraBaseProvider theme={theme}>
      <MDXProvider components={COMPONENTS}>{children}</MDXProvider>
    </ChakraBaseProvider>
  );
}
