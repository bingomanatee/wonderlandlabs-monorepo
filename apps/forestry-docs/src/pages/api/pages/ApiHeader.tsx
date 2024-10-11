import { Box } from '@chakra-ui/react';
import type { PropsWithChildren } from 'react';
import { PageDef } from '../../pageState.ts';

export default function ApiHeader({ page, children }: PropsWithChildren<{ page?: PageDef }>) {
  return <Box layerStyle="apiSummary">{children || page?.blurb}</Box>;
}
