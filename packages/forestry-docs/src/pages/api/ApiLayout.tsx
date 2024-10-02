import { Box, Heading, Text } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { sectionsState } from '../sections.state';
import { useEffect, useMemo, useState } from 'react';

const TITLE = 'Forestry API';

export default function ApiBase() {
  const [, setSections] = useState(sectionsState.value);

  useEffect(() => {
    const sub = sectionsState.subscribe((value) => setSections(value));
    return () => sub?.unsubscribe();
  }, []);

  const currentPage = sectionsState.currentPage();

  const atMenu = useMemo(() => !currentPage || currentPage?.name === 'api', [currentPage]);

  return (
    <Box as="main" layerStyle="pageColumnContainer">
      <Box as="section" id="pageColumn" layerStyle="pageColumn">
        <Box as="header">
          {!atMenu ? <Text textStyle="pageTitlePrefix">{TITLE}</Text> : null}
          <Heading variant="titleLogo">{!atMenu ? currentPage!.title : TITLE}</Heading>
        </Box>
        <Outlet />
      </Box>
    </Box>
  );
}
