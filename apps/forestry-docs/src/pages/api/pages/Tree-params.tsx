import { Box } from '@chakra-ui/react';
import ApiHeader from './ApiHeader.tsx';
import type { PageDef } from '../../pageState.ts';
import Summary from './Tree-params/summary.mdx';
import Content from './Tree-params/content.mdx';

export default function ForestPage({
  page,
}: {
  page: PageDef;
}) {
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
