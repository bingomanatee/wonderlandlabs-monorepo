import { Box, SimpleGrid, useBreakpointValue } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

export function HighlightContainer({ children }: PropsWithChildren) {
  const isWide = useBreakpointValue(
    {
      base: false,
      sm: true,
    },
    {
      ssr: false,
      fallback: 'base',
    }
  );

  return (
    <Box layerStyle="highlightContainer" id="highlightContainer">
      {isWide ? (
        <SimpleGrid
          minChildWidth={{ base: '150px', sm: '150px', md: '200px' }}
          spacing={{ base: '2px', sm: '5px', md: '8px', lg: '10px', xl: '12px' }}
        >
          {children}
        </SimpleGrid>
      ) : (
        <Box layerStyle="highlightsColumn">{children}</Box>
      )}
    </Box>
  );
}