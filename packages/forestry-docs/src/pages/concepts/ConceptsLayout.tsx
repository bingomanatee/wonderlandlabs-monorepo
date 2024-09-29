import { Box, Heading, Text, Image } from '@chakra-ui/react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { conceptsState, type Concept } from '../../lib/concepts.state';
import { NextPage } from './NextPage';
import { BackPage } from './BackPage';
import { Collection } from '@wonderlandlabs/forestry';
import { summary } from 'framer-motion/client';
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

export function Concepts() {
  const state = useRef(
    new Collection('concepts', {
      initial: { current: '', summary: null },
    })
  );

  const [{ current, summary }, setValue] = useState(state.current.value);

  useEffect(() => {
    const sub = state.current.subscribe(setValue);
    return () => sub.unsubscribe();
  }, []);

  const currentItem: Concept | undefined = useMemo(() => {
    return conceptsState.getConcept(current);
  }, [current]);

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
          {currentItem?.art ? (
            <Box layerStyle="pageImage">
              <Image
                style={{ opacity: 0.85 }}
                src={currentItem?.art}
                width={IMAGE_SIZE}
                height={IMAGE_SIZE}
              />
            </Box>
          ) : null}
          <Box as="header" layerStyle="conceptsHeader">
            <Text textStyle="pageTitlePrefix">{currentItem?.title ? TITLE + ':' : ''}</Text>
            <Heading as="h1" variant="conceptsTitle">
              {currentItem?.title ? currentItem?.title : TITLE}
            </Heading>
            {summary ? <Summary value={summary} /> : null}
          </Box>
          <Box as="article" layerStyle="pageColumnBody">
            <Box position="relative" zIndex={2}>
              <Outlet context={state.current} />
            </Box>
          </Box>
        </Box>
      </Box>
      {current ? <NextPage current={current} /> : null}
      {current ? <BackPage current={current} /> : null}
    </>
  );
}
