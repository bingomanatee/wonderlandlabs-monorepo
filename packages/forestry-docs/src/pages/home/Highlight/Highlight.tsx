import { useCallback, useEffect, useState, type PropsWithChildren, type ReactNode } from 'react';
import style from './Highlight.module.css';
import type { State, StateIF } from '../appState';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text } from '@chakra-ui/react';

type Props = {
  title: ReactNode;
  state: State;
  name: string;
  url?: string;
};

const CATS = /^concepts/i;
const SLASHES = /^\//;

function formattedUrl(s: string) {
  if (SLASHES.test(s)) return formattedUrl(s.replace(SLASHES, ''));
  if (CATS.test(s)) return formattedUrl(s.replace(CATS, ''));
  return '/concepts/' + s;
}
export function Highlight({ title, name, children, state, url }: PropsWithChildren<Props>) {
  const [stateValue, setStateValue] = useState<StateIF>(state.value);

  const navigate = useNavigate();

  useEffect(() => {
    state.register(name);

    const sub = state.subscribe({ next: (value: StateIF) => setStateValue(value) });

    return () => sub?.unsubscribe();
  }, [state]);

  const localHandleHover = useCallback(() => {
    state.handleHover(name);
  }, [state]);

  const localBlur = useCallback(() => state.blur(), [state]);

  const handleClick = useCallback(() => {
    if (url) navigate(formattedUrl(url));
  }, [url, navigate]);

  return (
    <Box
      as="section"
      className={
        stateValue.target === name
          ? `${style.container} ${style['container-hovered']}`
          : style.container
      }
      onMouseLeave={localBlur}
      onClick={handleClick}
      onMouseEnter={localHandleHover}
      layerStyle="highlight"
    >
      {title ? (
        <Heading as="h2" variant="highlight">
          {title}
        </Heading>
      ) : null}
      <Box layerStyle="highlightText">
        <Text textStyle="highlightText">{children}</Text>
      </Box>
    </Box>
  );
}
