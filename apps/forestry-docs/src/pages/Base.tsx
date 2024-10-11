import { Box, Image, Text } from '@chakra-ui/react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LOGO_SIZE } from '../lib/chakra/themeConstants';
import { useCallback } from 'react';

export function Base() {
  const navigate = useNavigate();

  const goHome = useCallback(() => navigate('/'), [navigate]);

  return (
    <Box layerStyle="root">
      <Box layerStyle="logo" onClick={goHome}>
        <Image src="/img/logo_light.png" width={`${LOGO_SIZE}px`} height={`${LOGO_SIZE}px`} />
        <Text textStyle="logoText">Home</Text>
      </Box>
      <Box layerStyle="rootContent" id="rootContent">
        <Outlet />
      </Box>
    </Box>
  );
}
