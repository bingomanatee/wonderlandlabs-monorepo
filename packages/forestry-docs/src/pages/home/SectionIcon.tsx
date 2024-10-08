import { useNavigate } from 'react-router-dom';
import type { PageDef } from '../pageState.ts';
import { useCallback } from 'react';
import { Heading, Image, Box } from '@chakra-ui/react';

export function SectionIcon({ page }: { page: PageDef }) {
  const navigate = useNavigate();
  const go = useCallback(() => (page.url ? navigate(page.url) : null), [navigate, page]);
  return (
    <Box
      layerStyle="sectionIcon"
      onClick={go}
      transition="background-color"
      transitionDuration="1s"
    >
      {page.icon ? (
        <Box layerStyle="sectionIconImage">
          <Image src={page.icon} width="100%" height="100%" />
        </Box>
      ) : null}
      <Heading variant="sectionIcon">{page.title}</Heading>
    </Box>
  );
}
