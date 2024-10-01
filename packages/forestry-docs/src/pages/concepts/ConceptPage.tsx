import { Box } from '@chakra-ui/react';
import {
  useEffect,
  useMemo,
  useState,
  type FC,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import { conceptsState, type ConceptInfo } from './concepts.state';
import type { CollectionIF } from '@wonderlandlabs/forestry/build/src/types/type.collection';

type Props = { name: string; summary: FC };

export const ConceptPage = function ({
  name,
  summary: Summary,
  children,
}: PropsWithChildren<Props>) {
  const [_V, setValue] = useState<ConceptInfo>(conceptsState.value);

  useEffect(() => {
    const sub = conceptsState.subscribe(setValue);
    return () => sub.unsubscribe();
  }, []);

  const concept = useMemo(() => conceptsState.getConcept(name), [name]);

  const layoutState: CollectionIF<{ current: string; summary: ReactNode }> = useOutletContext();

  useEffect(() => {
    if (!(concept && Summary)) return;
    layoutState.next({ current: concept.name, summary: <Summary /> });
  }, [layoutState, concept, Summary]);

  return (
    <Box layerStyle="content" className="textual">
      {children}
    </Box>
  );
};
