import { useCallback, useEffect, useState } from 'react';
import style from './Highlight.module.css';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text } from '@chakra-ui/react';
import { ConceptsState, conceptsState, type Concept } from '../../concepts/concepts.state';

export function Highlight({ concept }: { concept: Concept }) {
  const navigate = useNavigate();

  const [value, setValue] = useState(conceptsState.value);

  useEffect(() => {
    const sub = conceptsState.subscribe(setValue);
    return () => sub.unsubscribe();
  }, []);

  const handleClick = useCallback(() => {
    navigate(ConceptsState.fullUrl(concept.name));
  }, [concept, navigate]);

  return (
    <Box
      as="section"
      className={
        value.target === concept.name
          ? `${style.container} ${style['container-hovered']}`
          : style.container
      }
      onMouseLeave={() => conceptsState.blur()}
      onClick={handleClick}
      onMouseEnter={() => conceptsState.focus(concept.name)}
      layerStyle="highlight"
    >
      {concept.title ? (
        <Heading as="h2" variant="highlight">
          {concept.title}
        </Heading>
      ) : null}
      <Box layerStyle="highlightText">
        <Text textStyle="highlightText">{concept.blurb}</Text>
      </Box>
    </Box>
  );
}
