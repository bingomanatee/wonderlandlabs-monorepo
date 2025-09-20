import React from 'react';
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';
import useForestryLocal from '../hooks/useForestryLocal';
import CodeBlock from './CodeBlock';

interface SnippetBlockProps {
  snippetName: string;
  language?: string;
  folder?: string;
  ts?: boolean; // Use .ts extension instead of .tsx.txt
}

// Zod schema for snippet state
const SnippetStateSchema = z.object({
  code: z.string(),
  loading: z.boolean(),
  error: z.string().nullable(),
});

type SnippetState = z.infer<typeof SnippetStateSchema>;

/**
 * Modern Forestry 4.1.3 subclass for snippet loading
 */
class SnippetForest extends Forest<SnippetState> {
  constructor(
    private snippetName: string,
    private folder?: string,
    private ts?: boolean
  ) {
    super({
      name: `snippet-${folder ? `${folder}-` : ''}${snippetName}`,
      schema: SnippetStateSchema,
      value: {
        code: '',
        loading: true,
        error: null,
      },
    });
  }

  // Set loading state
  setLoading(loading: boolean) {
    this.mutate((draft) => {
      draft.loading = loading;
      if (loading) {
        draft.error = null;
      }
    });
  }

  // Set error state
  setError(error: string) {
    this.mutate((draft) => {
      draft.error = error;
      draft.loading = false;
      draft.code = `// Error loading snippet: ${this.snippetName}\n// Error: ${error}`;
    });
  }

  // Set successful code content
  setCode(code: string) {
    this.mutate((draft) => {
      draft.code = code;
      draft.loading = false;
      draft.error = null;
    });
  }

  // Main load method
  async loadSnippet() {
    this.setLoading(true);

    try {
      const extension = this.ts ? '.ts' : '.tsx.txt';
      const path = this.folder
        ? `/snippets/${this.folder}/${this.snippetName}${extension}`
        : `/snippets/${this.snippetName}${extension}`;

      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load snippet: ${this.snippetName}`);
      }

      const text = await response.text();

      // Filter out sync headers from auto-generated snippets
      const cleanText = text
        .split('\n')
        .filter((line) => !line.startsWith('// Auto-generated snippet from:'))
        .filter((line) => !line.startsWith('// Description:'))
        .filter((line) => !line.startsWith('// Last synced:'))
        .filter((line) => !line.startsWith('// DO NOT EDIT'))
        .join('\n')
        .replace(/^\n+/, ''); // Remove leading empty lines

      this.setCode(cleanText);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to load snippet:', this.snippetName, errorMsg);
      this.setError(errorMsg);
    }
  }

  // Computed properties
  get isLoading(): boolean {
    return this.value.loading;
  }

  get hasError(): boolean {
    return !!this.value.error;
  }

  get displayTitle(): string {
    return this.folder ? `${this.folder}/${this.snippetName}` : this.snippetName;
  }
}

// Factory function for useForestryLocal
const createSnippetStore = (snippetName: string, folder?: string, ts?: boolean) =>
  new SnippetForest(snippetName, folder, ts);

const SnippetBlock: React.FC<SnippetBlockProps> = ({
  snippetName,
  language = 'typescript',
  folder,
  ts,
}) => {
  const [state, snippetForest] = useForestryLocal<SnippetState>(
    createSnippetStore,
    snippetName,
    folder,
    ts
  );

  // Load snippet on mount using the subclass method
  React.useEffect(() => {
    snippetForest.loadSnippet();
  }, [snippetForest]);

  // Enhanced loading state using computed property
  if (snippetForest.isLoading) {
    return (
      <CodeBlock language={language} title={`Loading ${snippetName}...`}>
        {`// Loading snippet: ${snippetName}${folder ? ` from ${folder}` : ''}...\n// Please wait...`}
      </CodeBlock>
    );
  }

  // Enhanced error state using computed property
  if (snippetForest.hasError) {
    return (
      <CodeBlock language={language} title={`Error loading ${snippetName}`}>
        {`// Failed to load snippet: ${snippetName}\n// Error: ${state.error}\n// Please check the file path and try again.`}
      </CodeBlock>
    );
  }

  // Success state using computed property for title
  return (
    <CodeBlock language={language} title={snippetForest.displayTitle}>
      {state.code}
    </CodeBlock>
  );
};

export default SnippetBlock;
