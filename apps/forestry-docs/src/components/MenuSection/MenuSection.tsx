import { useCallback, PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text } from '@chakra-ui/react';

export function MenuSection({
  title,
  children,
  url,
  art,
}: PropsWithChildren<Partial<{ title: string; art: string; url: string }>>) {
  const navigate = useNavigate();
  const handleClick = useCallback(() => {
    if (url) navigate(url);
  }, [url, navigate]);

  return (
    <Box as="section" position="relative" onClick={handleClick} layerStyle="menuSection">
      {art ? (
        <Box
          w="100%"
          h="100%"
          position="absolute"
          backgroundImage={`url("${art}")`}
          backgroundSize="cover"
          backgroundRepeat="no-repeat"
          opacity={0}
          left={0}
          top={0}
          right={0}
          bottom={0}
        />
      ) : null}
      {title ? (
        <Heading as="h2" variant="menuSection">
          {title}
        </Heading>
      ) : null}
      <Box layerStyle="highlightText">
        <Text textStyle="highlightText">{children}</Text>
      </Box>
    </Box>
  );
}
