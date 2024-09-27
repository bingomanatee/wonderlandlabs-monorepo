import { Box, Heading, Text, Image } from '@chakra-ui/react';
import type { CollectionIF } from '@wonderlandlabs/forestry/build/src/types/type.collection';
import { useRef, useEffect, useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { ConceptsLayoutState, INITIAL, type ConceptsLayoutStateValue } from './ConceptsLayoutState';

const TITLE = 'Forestry Concepts';
const IMAGE_SIZE = { base: '150px', sm: '150px', md: '200px', lg: '250px' };

function Summary({ value }: { value: string | ReactNode }) {
  if (!value) return null;
  if (typeof value === 'string') {
    return (
      <Box className="textual" layerStyle="pageTitleSummary">
        <Text textStyle="pageTitleSummary">{value}</Text>
      </Box>
    );
  }
  return (
    <Box className="textual" textStyle="pageTitleSummary" layerStyle="pageTitleSummary">
      {value}
    </Box>
  );
}

export function Concepts() {
  const state = useRef<CollectionIF<ConceptsLayoutStateValue>>(new ConceptsLayoutState());
  const [value, setValue] = useState<ConceptsLayoutStateValue>(INITIAL);
  useEffect(() => {
    const sub = state.current.subscribe((v: ConceptsLayoutStateValue) => setValue(v));
    return () => sub?.unsubscribe();
  }, []);

  return (
    <Box as="section" id="concepts-layout" layerStyle="pageColumnContainer">
      <Box layerStyle="pageColumn" id="pageColumn">
        {value.image ? (
          <Box layerStyle="pageImage">
            <Image src={value.image} width={IMAGE_SIZE} height={IMAGE_SIZE} />
          </Box>
        ) : null}
        <Box as="header" layerStyle="pageColumnHeader">
          <Text textStyle="pageTitlePrefix">{value.title ? TITLE + ':' : ''}</Text>
          <Heading as="h1" variant="pageTitle">
            {value.title ? value.title : TITLE}
          </Heading>
          {<Summary value={value.summary} />}
        </Box>
        <Box as="article" layerStyle="pageColumnBody">
          <Outlet context={{ state: state.current }} />
        </Box>
      </Box>
    </Box>
  );
}
