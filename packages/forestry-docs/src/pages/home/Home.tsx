import { useEffect, useState } from 'react';
import './Home.module.css';

import { Highlight } from './Highlight/Highlight';
import { Box, Heading, SimpleGrid, Text, useBreakpointValue } from '@chakra-ui/react';
import { conceptsState } from '../concepts/concepts.state';
import { sectionsState } from '../sections.state';
import { HighlightContainer } from '../../components/HighlightContainer.tsx';
import { SectionIcon } from './SectionIcon.tsx';

function Home() {
  const [concepts, setConcepts] = useState(conceptsState.value);
  const [sections, setSections] = useState(sectionsState.value);

  useEffect(() => {
    const sub = conceptsState.subscribe((v) => setConcepts(v));
    const sub2 = sectionsState.subscribe((v) => setSections(v));
    return () => {
      sub?.unsubscribe();
      sub2?.unsubscribe();
    };
  }, []);

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
    <Box layerStyle="pageColumnContainer">
      <Box as="section" id="pageColumn" layerStyle="pageColumn">
        <Box as="header">
          <Heading as="h1" size="xl" variant="titleLogo">
            FORESTRY
          </Heading>
          <Text textStyle="logoSubtext">A robust state system for JavaScript and React</Text>
        </Box>
        <Box layerStyle="sectionIcons">
          {isWide ? (
            <SimpleGrid
              columns={2}
              spacing={{ base: '5px', sm: '5px', md: '6px', lg: '7px', xl: '8px' }}
            >
              {sections.sections.map((page) => (
                <SectionIcon key={page.name} page={page} />
              ))}
            </SimpleGrid>
          ) : (
            <Box layerStyle="sectionIconsColumn">
              {sections.sections.map((page) => (
                <SectionIcon key={page.name} page={page} />
              ))}
            </Box>
          )}
        </Box>

        <HighlightContainer>
          {concepts.concepts.map((concept) => (
            <Highlight key={concept.name} concept={concept} />
          ))}
        </HighlightContainer>
      </Box>
    </Box>
  );
}

export default Home;
