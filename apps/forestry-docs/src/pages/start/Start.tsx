import { Box, Heading } from '@chakra-ui/react';
import Content from './content.mdx';
export default function Start() {
  return (
    <Box as="main" layerStyle="pageColumnContainer">
      <Box as="section" id="pageColumn" layerStyle="pageColumn">
        <Box as="header">
          <Heading variant="titleLogo">Getting Started</Heading>
        </Box>
        <Content />
      </Box>
    </Box>
  );
}
