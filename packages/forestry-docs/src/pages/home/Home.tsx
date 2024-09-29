import { useState, useEffect, useRef } from 'react';
import style from './Home.module.css';

import { Highlight } from './Highlight/Highlight';
import { appState, State } from './appState';
import { Heading, Box, Text, useBreakpointValue, SimpleGrid } from '@chakra-ui/react';

function Home() {
  const state = useRef<State>(appState());

  const [value, setValue] = useState(state.current.value);

  useEffect(() => {
    state.current?.subscribe((v) => setValue(v));
    () => state.current.destroy();
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
  const highlights = [
    <Highlight title="Journaled" name="journeld" url="journaled" state={state.current}>
      <p>
        Every change and action is logged and timestamped, even across multiple state collections,
        for easy diagnosis
      </p>
    </Highlight>,
    <Highlight title="Transactional" name="trans" url="transactional" state={state.current}>
      Actions are either fully executed, or revert to the previous state
    </Highlight>,
    <Highlight title="Observable" name="obs" state={state.current} url="observable">
      Built on RxJS, Forestry allows for observation of changes system wide as well as piping to all
      RxJS modifiers
    </Highlight>,
    <Highlight title="Synchronous" name="sync" state={state.current} url="synchronous">
      Changes occur in real time
    </Highlight>,
    <Highlight title="Transportable" name="transportable" state={state.current} url="transportable">
      State value and actions are contained within single instances, making full system tests and
      global state easy to accomplish.
    </Highlight>,
    <Highlight title="Typescript Friendly" name="typescript" state={state.current} url="typescript">
      Forestry classes and methods can be keyed to define the type of value managed by the state.
    </Highlight>,
  ];
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
