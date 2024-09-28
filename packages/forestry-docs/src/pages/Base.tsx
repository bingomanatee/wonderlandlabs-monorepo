import { Box, Image, Portal, Text } from '@chakra-ui/react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LOGO_SIZE } from '../lib/chakra/themeConstants';
import { useCallback, useEffect, useState } from 'react';
import { NavValue, navigator } from '../lib/navigation';
import { NextPage } from '../lib/chakra/NextPage';
import { BackPage } from '../lib/chakra/BackPage';

export function Base() {
  const navigate = useNavigate();

  const goHome = useCallback(() => navigate('/'), [navigate]);

  const [nav, setNav] = useState<NavValue>(navigator.value);

  useEffect(() => {
    const sub = navigator.subscribe((value) => setNav(value));
    return () => sub?.unsubscribe();
  });

  return (
    <Box layerStyle="root">
      <Box layerStyle="logo" onClick={goHome}>
        <Image src="/img/logo_light.png" width={`${LOGO_SIZE}px`} height={`${LOGO_SIZE}px`} />
        <Text textStyle="logoText">Home</Text>
      </Box>
      <Box layerStyle="rootContent" id="rootContent">
        <Outlet />
      </Box>
      {nav.pageSet.length ? <NextPage /> : null}
      {nav.pageSet.length ? <BackPage /> : null}
    </Box>
  );
}
