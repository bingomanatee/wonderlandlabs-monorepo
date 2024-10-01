import { Heading, Box } from '@chakra-ui/react';
import { MenuSection } from '../../components/MenuSection/MenuSection.tsx';
import { HighlightContainer } from '../../components/HighlightContainer.tsx';
import { PropsWithChildren } from 'react';

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
      <ApiMenuHead>External Resources</ApiMenuHead>

      <HighlightContainer>
        <MenuSection title="Collection">
          the general purpose "state class" with named actions; manages data for a single Tree
          instance
        </MenuSection>
        <MenuSection title="FormCollection">
          a multi-Tree collection for form management.
        </MenuSection>
        <MenuSection title="MapCollection">
          a Collection child specifically oriented towards Map content
        </MenuSection>
      </HighlightContainer>
      <ApiMenuHead>Internal Resources</ApiMenuHead>
      <HighlightContainer>
        <MenuSection title="Tree">A single atomic store for all data</MenuSection>
        <MenuSection title="Forest">
          Synchronizes collection transactions and bridges connections between Trees
        </MenuSection>
      </HighlightContainer>
    </>
  );
}
