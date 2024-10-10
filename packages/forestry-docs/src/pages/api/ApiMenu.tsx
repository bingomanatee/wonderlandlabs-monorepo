import { Heading, Box } from '@chakra-ui/react';
import { MenuSection } from '../../components/MenuSection/MenuSection.tsx';
import { HighlightContainer } from '../../components/HighlightContainer.tsx';
import { PropsWithChildren } from 'react';
import ApiContent from './content.mkd';
function ApiMenuHead({ children }: PropsWithChildren) {
  return (
    <Box display="flex" flexDirection="row" justifyContent="center">
      <Heading position="relative" variant="menuHead">
        {children}
      </Heading>
    </Box>
  );
}

export default function ApiMenu() {
  return (
    <>
      <ApiMenuHead>Core Classes</ApiMenuHead>
      <HighlightContainer>
        <MenuSection url="tree" title="Tree">
          A single atomic value
        </MenuSection>
        <MenuSection url="forest" title="Forest">
          The core dataset for a series of relates states
        </MenuSection>
      </HighlightContainer>
      <ApiMenuHead>Extended Controllers</ApiMenuHead>
      <HighlightContainer>
        <MenuSection url="/api/collection" title="Collection">
          A decorator for a single tree; adds change actions to a single Tree
        </MenuSection>
        <MenuSection url="/api/form-collection" title="FormCollection">
          A utility class for managing a form.
        </MenuSection>
        <MenuSection url="/api/map-collection" title="MapCollection">
          An optimized class for managing a Map based collection. Uses proxies for low-memory
          journals
        </MenuSection>
      </HighlightContainer>

      <ApiContent />
    </>
  );
}
