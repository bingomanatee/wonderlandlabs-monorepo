import { Text, Heading, Box } from '@chakra-ui/react';

type AnyProps = Record<string, any>;

export const MARKDOWN_COMPONENTS = {
  p: (props: AnyProps) => <Text textStyle="mdParagraph" as="p" {...props} />,
  h1: (props: AnyProps) => <Heading my={4} size="lg" as="h1" {...props} />,
  h2: (props: AnyProps) => <Heading my={2} size="md" as="h2" {...props} />,
  pre: (props: AnyProps) => (
    <Box
      className="codeBlock"
      layerStyle="mdCode"
      style={{
        color: 'var(--code-color)!important',
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
