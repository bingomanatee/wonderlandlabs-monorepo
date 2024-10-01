import { Text, Heading, Box } from '@chakra-ui/react';

type AnyProps = Record<string, unknown>;

export const MARKDOWN_COMPONENTS = {
  p: (props: AnyProps) => <Text textStyle="mdParagraph" as="p" {...props} />,
  h1: (props: AnyProps) => <Heading my={4} variant="mdH1" as="h1" {...props} />,
  h2: (props: AnyProps) => <Heading my={2} variant="mdH2" as="h2" {...props} />,
  pre: (props: AnyProps) => (
    <Box
      className="codeBlock"
      layerStyle="mdCode"
      marginX={8}
      marginBottom={'30px'}
      style={{
        color: 'var(--code-color)!important',
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderImageSource: 'url("/frames/code-frame.svg")',
        borderImageSlice: '8',
        borderImageWidth: '2px 4px 4px 1px',
        borderImageRepeat: 'stretch stretch',
        borderStyle: 'solid',
      }}
    >
      {props.children}
    </Box>
  ),
  code: (props: AnyProps) => <Text as="span" textStyle="mdVariable" {...props} />,
};
