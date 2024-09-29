import { useState, useEffect } from 'react';
import './Home.module.css';

import { Highlight } from './Highlight/Highlight';
import { Heading, Box, Text, useBreakpointValue, SimpleGrid } from '@chakra-ui/react';
import { conceptsState } from '../concepts/concepts.state';

function Home() {
  const [value, setValue] = useState(conceptsState.value);

  useEffect(() => {
    const sub = conceptsState.subscribe((v) => setValue(v));
    () => sub?.unsubscribe();
  }, []);
  const highlightsLayerType = useBreakpointValue(
    {
      base: 'highlightsColumn',
      sm: 'highlights',
    },
    {
      ssr: false,
      fallback: 'base',
    }
  );
  const highlights = value.concepts.map((concept) => <Highlight concept={concept} />);
  return (
    <>
      <Box as="header" layerStyle="homeHeader">
        <Heading as="h1" size="xl" variant="titleLogo">
          FORESTRY
        </Heading>
        <Text textStyle="logoSubtext">
          A Journaled, Transactional state system
          <br />
          for JavaScript and React
        </Text>
      </Box>
      <Box layerStyle="highlightContainer" id="highlightContainer">
        {highlightsLayerType === 'highlights' ? (
          <SimpleGrid
            minChildWidth={{ base: '150px', sm: '150px', md: '200px' }}
            spacing={{ base: '5px', sm: '5px', md: '6px', lg: '7px', xl: '8px' }}
          >
            {highlights}
          </SimpleGrid>
        ) : (
          <Box layerStyle={highlightsLayerType}>{highlights}</Box>
        )}
      </Box>
    </>
  );
}

export default Home;
