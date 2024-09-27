import { Box } from '@chakra-ui/react';
import { useEffect, type FC, type PropsWithChildren } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ConceptsLayoutState } from './ConceptsLayoutState';

type Props = { title: string; summary: FC; image: string };

export const ConceptPage = function ({
  title,
  summary: Summary,
  image,
  children,
}: PropsWithChildren<Props>) {
  const { state } = useOutletContext<{ state: ConceptsLayoutState }>();
  useEffect(() => {
    state.setTitle(title);
    state.setImage(image);
    state.setSummary(<Summary />);
  }, [state, title, Summary]);

  return (
    <Box layerStyle="content" className="textual">
      {children}
    </Box>
  );
};
