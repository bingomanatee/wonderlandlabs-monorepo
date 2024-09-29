import { Box, Heading, Text, Image } from '@chakra-ui/react';
import type { CollectionIF } from '@wonderlandlabs/forestry/build/src/types/type.collection';
import { useRef, useEffect, useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { ConceptsLayoutState, INITIAL, type ConceptsLayoutStateValue } from './ConceptsLayoutState';
import { navigator } from '../../lib/navigation';
import { Helmet } from 'react-helmet';
const TITLE = 'Forestry Concepts';
const IMAGE_SIZE = { base: '150px', sm: '175px', md: '180px', lg: '200px' };

function Summary({ value }: { value: string | ReactNode }) {
  if (!value) return null;
  if (typeof value === 'string') {
    return (
      <Box className="textual" layerStyle="conceptsSummary">
        <Text textStyle="conceptsSummary">{value}</Text>
      </Box>
    );
  }
  return (
    <Box className="textual" textStyle="conceptsSummary" layerStyle="conceptsSummary">
      {value}
    </Box>
  );
}
const PAGES = [
  '/concepts/journaled',
  '/concepts/transactional',
  '/concepts/observable',
  '/concepts/synchronous',
  '/concepts/transportable',
  '/concepts/typescript',
];

export function Concepts() {
  const state = useRef<CollectionIF<ConceptsLayoutStateValue>>(new ConceptsLayoutState());
  const [value, setValue] = useState<ConceptsLayoutStateValue>(INITIAL);
  useEffect(() => {
    navigator.setPages(PAGES);
    navigator.setParent('/');
    const sub = state.current.subscribe((v: ConceptsLayoutStateValue) => setValue(v));
    return () => {
      sub?.unsubscribe();
      navigator.setPages([]);
      navigator.setParent('');
    };
  }, []);

  return (
    <>
      <Helmet>
        <style>
          {`      body {
          background-image: url('/pictures/blue-forest-up.png')!important;
          background-position: top center;
        }
        `}
        </style>
      </Helmet>
      <Box as="section" id="pageColumnContainer" layerStyle="pageColumnContainer">
        <Box layerStyle="pageColumn" id="pageColumn">
          {value.image ? (
            <Box layerStyle="pageImage">
              <Image
                style={{ opacity: 0.85 }}
                src={value.image}
                width={IMAGE_SIZE}
                height={IMAGE_SIZE}
              />
            </Box>
          ) : null}
          <Box as="header" layerStyle="conceptsHeader">
            <Text textStyle="pageTitlePrefix">{value.title ? TITLE + ':' : ''}</Text>
            <Heading as="h1" variant="conceptsTitle">
              {value.title ? value.title : TITLE}
            </Heading>
            {<Summary value={value.summary} />}
          </Box>
          <Box as="article" layerStyle="pageColumnBody">
            <Box layerStyle="contentBackground" />
            <Box position="relative" zIndex={2}>
              <Outlet context={{ state: state.current }} />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
