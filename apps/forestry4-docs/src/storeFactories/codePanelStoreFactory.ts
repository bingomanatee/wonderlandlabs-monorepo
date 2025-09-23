import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';
import Prism from 'prismjs';

// Zod schema for CodePanel state
const CodePanelStateSchema = z.object({
  // Content properties
  content: z.string(),
  imports: z.string(),
  mainContent: z.string(),
  language: z.string(),
  title: z.string().optional(),

  // Snippet loading properties
  snippetName: z.string().optional(),
  folder: z.string().optional(),

  // Display configuration
  showImportsToggle: z.boolean(),
  showCopyButton: z.boolean(),
  showExpandButton: z.boolean(),
  maxHeight: z.string(),

  // State flags
  isExpanded: z.boolean(),
  isImportsExpanded: z.boolean(),
  needsExpansion: z.boolean(),

  // Advanced features
  enableDOMObservation: z.boolean(),
  enablePrismHighlighting: z.boolean(),

  // Loading/error states
  loading: z.boolean(),
  error: z.string().nullable(),
});

export type CodePanelState = z.infer<typeof CodePanelStateSchema>;

export interface CodePanelConfig {
  // Essential props only
  language: string;
  snippetName?: string;
  folder?: string;
  title?: string;

  // Alternative content (fallback when no snippet)
  content?: string;
  children?: React.ReactNode;
}

/**
 * Forestry store for CodePanel state management
 */
export class CodePanelForest extends Forest<CodePanelState> {
  private contentRef: React.RefObject<HTMLDivElement> | null = null;
  private codeRef: React.RefObject<HTMLElement> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private resizing = false;

  constructor(config: CodePanelConfig) {
    if (!(config.snippetName && config.language)) {
      console.log('bad config:', config);
      throw new Error('bad Config on CodePanel');
    }
    super({
      name: 'code-panel',
      schema: CodePanelStateSchema,
      value: {
        // Essential config
        language: config.language,
        title: config.title,
        snippetName: config.snippetName,
        folder: config.folder ?? '',

        // Content (derived from loading or fallback)
        content: `// Loading`,
        imports: '',
        mainContent: '',

        // UI configuration (sensible defaults)
        showImportsToggle: true,
        showCopyButton: true,
        showExpandButton: true,
        maxHeight: '300px',

        // State flags (initial values)
        isExpanded: false,
        isImportsExpanded: false,
        needsExpansion: false,

        // Advanced features (enabled by default)
        enableDOMObservation: true,
        enablePrismHighlighting: true,

        // Loading/error states
        loading: false,
        error: null,
      },
    });
    this.loadSnippet();
  }

  // Computed properties
  get hasImports(): boolean {
    return this.value.imports.trim().length > 0;
  }

  get hasMainContent(): boolean {
    return this.value.mainContent.trim().length > 0;
  }

  get displayContent(): string {
    // Handle loading state
    if (this.value.loading) {
      return `// Loading snippet: ${this.path}...\n// Please wait...`;
    }

    // Handle error state
    if (this.value.error) {
      return `// Failed to load snippet: ${this.path}\n// Error: ${this.value.error}\n// Please check the file path and try again.`;
    }

    // Handle normal content with imports logic
    if (this.hasImports && this.hasMainContent) {
      return this.value.isImportsExpanded
        ? `${this.value.imports}\n\n${this.value.mainContent}`
        : this.value.mainContent;
    }

    return this.value.content;
  }

  get fullContent(): string {
    if (this.hasImports && this.hasMainContent) {
      return `${this.value.imports}\n\n${this.value.mainContent}`;
    }
    return this.value.content;
  }

  get shouldShowImportsToggle(): boolean {
    return this.value.showImportsToggle && this.hasImports;
  }

  // Actions
  toggleExpansion() {
    this.mutate((draft) => {
      draft.isExpanded = !draft.isExpanded;
    });
  }

  toggleImports() {
    this.mutate((draft) => {
      draft.isImportsExpanded = !draft.isImportsExpanded;
    });
  }

  setExpanded(expanded: boolean) {
    this.mutate((draft) => {
      draft.isExpanded = expanded;
    });
  }

  setImportsExpanded(expanded: boolean) {
    this.mutate((draft) => {
      draft.isImportsExpanded = expanded;
    });
  }

  setNeedsExpansion(needs: boolean) {
    this.mutate((draft) => {
      draft.needsExpansion = needs;
    });
  }

  updateContent(content: string, imports?: string, mainContent?: string) {
    this.mutate((draft) => {
      draft.content = content;
      if (imports !== undefined) draft.imports = imports;
      if (mainContent !== undefined) draft.mainContent = mainContent;
    });
  }

  get path() {
    const { folder, snippetName, language } = this.value;
    const extension = language === 'tsx' ? 'tsx' : 'ts';

    return folder
      ? `/snippets/${folder}/${snippetName}.${extension}`
      : `/snippets/${snippetName}.${extension}`;
  }

  // Snippet loading functionality
  async loadSnippet() {
    const { snippetName } = this.value;

    this.setLoading(true);

    try {
      const response = await fetch(this.path);
      if (!response.ok) {
        console.error('snippet load failure:', this.value, response);
        throw new Error(`Failed to load snippet: ${snippetName}`);
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

      const { imports, mainContent } = this.separateImports(cleanText);

      this.updateContent(cleanText, imports, mainContent);
      this.setLoading(false);
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Separate imports from main content (copied from existing logic)
  private separateImports(code: string) {
    const lines = code.split('\n');
    let lastImportIndex = -1;

    // Find the last line that starts with 'import'
    for (let i = 0; i < lines.length; i++) {
      const trimmedLine = lines[i].trim();
      if (trimmedLine.startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    // If no imports found, return original text as main content
    if (lastImportIndex === -1) {
      return { imports: '', mainContent: code };
    }

    // Find the end of the import section by looking for the last line with quotes after the last import
    let importSectionEnd = lastImportIndex;
    for (let i = lastImportIndex; i < lines.length; i++) {
      const line = lines[i];
      // Check if line contains quotes (single or double) and is part of import section
      if ((line.includes("'") || line.includes('"')) && i <= lastImportIndex + 10) {
        // reasonable limit
        importSectionEnd = i;
      } else if (line.trim() === '' && i === importSectionEnd + 1) {
        // Include one empty line after imports
        importSectionEnd = i;
        break;
      } else if (line.trim() !== '' && i > lastImportIndex) {
        // Stop at first non-empty, non-import line
        break;
      }
    }

    const imports = lines.slice(0, importSectionEnd + 1).join('\n');
    const mainContent = lines
      .slice(importSectionEnd + 1)
      .join('\n')
      .replace(/^\n+/, '');

    return { imports, mainContent };
  }

  setLoading(loading: boolean) {
    this.mutate((draft) => {
      draft.loading = loading;
      if (loading) draft.error = null;
    });
  }

  setError(error: string) {
    this.mutate((draft) => {
      draft.error = error;
      draft.loading = false;
    });
  }

  // DOM interaction methods
  setRefs(contentRef: React.RefObject<HTMLDivElement>, codeRef: React.RefObject<HTMLElement>) {
    this.contentRef = contentRef;
    this.codeRef = codeRef;
  }

  checkExpansionNeeds() {
    if (this.contentRef?.current) {
      const element = this.contentRef.current;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
      const needsExp = scrollHeight > clientHeight;

      if (needsExp !== this.value.needsExpansion) {
        this.setNeedsExpansion(needsExp);
      }
    }
  }

  private checkExpansionWithHighlight = () => {
    if (this.resizing) return;

    this.checkExpansionNeeds();

    if (this.value.enablePrismHighlighting && this.codeRef?.current) {
      this.resizing = true;
      Prism.highlightElement(this.codeRef.current);
      setTimeout(() => {
        this.resizing = false;
      }, 200);
    }
  };

  startDOMObservation() {
    if (!this.value.enableDOMObservation || !this.contentRef?.current) return;

    this.checkExpansionWithHighlight();

    // Setup MutationObserver
    this.mutationObserver = new MutationObserver(this.checkExpansionWithHighlight);
    this.mutationObserver.observe(this.contentRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // Setup ResizeObserver
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(this.checkExpansionWithHighlight);
      this.resizeObserver.observe(this.contentRef.current);
    }
  }

  stopDOMObservation() {
    this.mutationObserver?.disconnect();
    this.resizeObserver?.disconnect();
    this.mutationObserver = null;
    this.resizeObserver = null;
  }

  // Copy functionality
  async copyToClipboard(): Promise<{ success: boolean; message: string }> {
    try {
      await navigator.clipboard.writeText(this.fullContent);
      return { success: true, message: 'Copied to clipboard' };
    } catch (err) {
      return { success: false, message: 'Failed to copy' };
    }
  }

  // Cleanup
  destroy() {
    this.stopDOMObservation();
    super.destroy?.();
  }
}

// Factory function for useForestryLocal
export const createCodePanelStore = (config: CodePanelConfig) => new CodePanelForest(config);
