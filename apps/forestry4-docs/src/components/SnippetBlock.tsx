import React, { useMemo } from 'react';
import { Store } from '@wonderlandlabs/forestry4';
import useForestryLocal from '../hooks/useForestryLocal';
import CodeBlock from './CodeBlock';

interface SnippetBlockProps {
  snippetName: string;
  language?: string;
  folder?: string;
  ts?: boolean; // Use .ts extension instead of .tsx.txt
}

interface SnippetState {
  code: string;
  loading: boolean;
  error: string | null;
}

const createSnippetStore = (snippetName: string, folder?: string, ts?: boolean) =>
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
          const extension = ts ? '.ts' : '.tsx.txt';
          const path = folder
            ? `/snippets/${folder}/${snippetName}${extension}`
            : `/snippets/${snippetName}${extension}`;

          const response = await fetch(path);
          if (!response.ok) {
            throw new Error(`Failed to load snippet: ${snippetName}`);
          }

          const text = await response.text();

          // Filter out sync headers from auto-generated snippets
          const cleanText = text
            .split('\n')
            .filter(line => !line.startsWith('// Auto-generated snippet from:'))
            .filter(line => !line.startsWith('// Description:'))
            .filter(line => !line.startsWith('// Last synced:'))
            .filter(line => !line.startsWith('// DO NOT EDIT'))
            .join('\n')
            .replace(/^\n+/, ''); // Remove leading empty lines

          this.mutate((draft) => {
            draft.code = cleanText;
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
  ts,
}) => {
  const [state, store] = useForestryLocal(createSnippetStore, snippetName, folder, ts);

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
