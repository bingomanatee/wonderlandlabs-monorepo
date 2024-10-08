import { Box, Heading, Text } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router-dom';
import { PageDef, pageState } from '../pageState.ts';
import { useEffect, useMemo, useState } from 'react';

const TITLE = 'Forestry API';

export default function ApiBase() {
  const [, setPages] = useState(pageState.value);

  const location = useLocation();

  const pathname = useMemo(() => location.pathname, [location.pathname]);

  const currentPage: PageDef | undefined = useMemo(() => {
    return pageState.pageWithUrl(pathname);
  }, [pathname]);

  useEffect(() => {
    const sub = pageState.subscribe((value) => setPages(value));
    return () => {
      sub?.unsubscribe();
    };
  }, []);

  const title = useMemo(() => {
    if (pathname === '/api') return TITLE;
    if (currentPage) {
      return currentPage.title;
    }
    return '';
  }, [pathname, currentPage]);

  return (
    <Box as="main" layerStyle="pageColumnContainer">
      <Box as="section" id="pageColumn" layerStyle="pageColumn">
        <Box as="header">
          {pathname !== '/api' ? <Text textStyle="pageTitlePrefix">{TITLE}</Text> : null}
          <Heading variant="titleLogo">{title}</Heading>
        </Box>
        <Outlet />
      </Box>
    </Box>
  );
}
