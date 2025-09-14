import React, { useMemo } from 'react';
import { Store } from '@wonderlandlabs/forestry4';
import useForestryLocal from '../hooks/useForestryLocal';
import CodeBlock from './CodeBlock';

interface SnippetBlockProps {
  snippetName: string;
  language?: string;
  folder?: string;
}

interface SnippetState {
  code: string;
  loading: boolean;
  error: string | null;
}

const createSnippetStore = (snippetName: string, folder?: string) =>
  new Store<SnippetState>({
    name: `snippet-${folder ? `${folder}-` : ''}${snippetName}`,
    value: {
      code: '',
      loading: true,
      error: null,
    },
    actions: {
      loadSnippet: async function () {
        this.mutate((draft) => {
          draft.loading = true;
          draft.error = null;
        });

        try {
          const path = folder
            ? `/snippets/${folder}/${snippetName}.tsx.txt`
            : `/snippets/${snippetName}.tsx.txt`;

          const response = await fetch(path);
          if (!response.ok) {
            throw new Error(`Failed to load snippet: ${snippetName}`);
          }

          const text = await response.text();

          this.mutate((draft) => {
            draft.code = text;
            draft.loading = false;
          });
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          console.error('Failed to load snippet:', snippetName, errorMsg);

          this.mutate((draft) => {
            draft.error = errorMsg;
            draft.code = `// Error loading snippet: ${snippetName}\n// Error: ${errorMsg}`;
            draft.loading = false;
          });
        }
      },
    },
  });

const SnippetBlock: React.FC<SnippetBlockProps> = ({
  snippetName,
  language = 'typescript',
  folder,
}) => {
  const [state, store] = useForestryLocal(createSnippetStore, snippetName, folder);

  // Load snippet on mount
  React.useEffect(() => {
    store.$.loadSnippet();
  }, [store]);

  if (state.loading) {
    return <CodeBlock language={language}>// Loading...</CodeBlock>;
  }

  if (state.error) {
    return <CodeBlock language={language}>// Error: {state.error}</CodeBlock>;
  }

  return <CodeBlock language={language}>{state.code}</CodeBlock>;
};

export default SnippetBlock;
