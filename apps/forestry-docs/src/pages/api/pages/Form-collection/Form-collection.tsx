import { Box } from '@chakra-ui/react';
import ApiHeader from '../ApiHeader.tsx';
import type { PageDef } from '../../../pageState.ts';
import Summary from './summary.mdx';
import Content from './content.mdx';

export default function ForestPage({ page }: { page: PageDef }) {
  console.log('forest page:', page);
  return (
    <Box>
      <ApiHeader page={page}>
        <Summary />
      </ApiHeader>
      <Content />
    </Box>
  );
}
