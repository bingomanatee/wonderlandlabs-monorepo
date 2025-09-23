// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/codeTabsStoreFactory.ts
// Description: Forest-based CodeTabs store factory for managing tabbed code snippets
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/forestry4';

export interface CodeTab {
  label: string;
  language: string; // Required - no default, must be explicit
  code?: string;
  snippet?: string;
  folder?: string;
}

export interface TabContent {
  text: string;
  path?: string;
  error?: string;
  imports?: string;
  mainContent?: string;
  isExpanded?: boolean;
  isImportsExpanded?: boolean;
  needsExpansion?: boolean;
}

export interface CodeTabsState {
  tabContents: Array<TabContent>;
  activeIndex: number;
  loading: boolean;
}

// Branch class for managing tab computations
class TabComputationsBranch extends Forest<{
  displayContent: string;
  hasImports: boolean;
  hasMainContent: boolean;
  importCount: number;
}> {
  constructor(private tabContent: TabContent) {
    super({
      name: 'tab-computations',
      value: {
        displayContent: '',
        hasImports: false,
        hasMainContent: false,
        importCount: 0,
      },
    });
    this.updateComputations();
  }

  // Update all computed values based on tab content
  updateComputations() {
    const hasImports = this.tabContent?.imports && this.tabContent.imports.trim().length > 0;
    const hasMainContent =
      this.tabContent?.mainContent && this.tabContent.mainContent.trim().length > 0;

    const displayContent =
      hasImports && hasMainContent
        ? `${this.tabContent.imports}\n\n${this.tabContent.mainContent}`
        : this.tabContent?.text || '// Loading...';

    const importCount =
      this.tabContent?.imports?.split('\n').filter((line) => line.trim().startsWith('import'))
        .length || 0;

    this.mutate((draft) => {
      draft.displayContent = displayContent;
      draft.hasImports = hasImports;
      draft.hasMainContent = hasMainContent;
      draft.importCount = importCount;
    });
  }

  // Update the tab content and recompute
  setTabContent(content: TabContent) {
    this.tabContent = content;
    this.updateComputations();
  }
}

// Forest-based CodeTabs store
export class CodeTabsForest extends Forest<CodeTabsState> {
  constructor(tabs: CodeTab[], defaultIndex: number = 0) {
    super({
      name: 'code-tabs',
      value: {
        tabContents: tabs.map(() => ({
          text: '// Loading...',
          path: undefined,
          error: undefined,
          imports: undefined,
          mainContent: undefined,
          isExpanded: false,
          isImportsExpanded: false,
          needsExpansion: false,
        })),
        activeIndex: defaultIndex,
        loading: true,
      },
    });
  }

  // Get file extension based on language - no defaults, explicit only
  private getFileExtension(language: string): string {
    switch (language.toLowerCase()) {
      case 'typescript':
        return '.ts';
      case 'tsx':
        return '.tsx';
      case 'javascript':
        return '.js';
      case 'jsx':
        return '.jsx';
      case 'bash':
      case 'shell':
        return '.sh';
      case 'json':
        return '.json';
      default:
        throw new Error(
          `Unsupported language: ${language}. Must be one of: typescript, tsx, javascript, jsx, bash, json`
        );
    }
  }

  // Clean snippet text by removing sync headers
  private cleanSnippetText(text: string): string {
    return text
      .split('\n')
      .filter((line) => !line.startsWith('// Auto-generated snippet from:'))
      .filter((line) => !line.startsWith('// Description:'))
      .filter((line) => !line.startsWith('// Last synced:'))
      .filter((line) => !line.startsWith('// DO NOT EDIT'))
      .join('\n')
      .replace(/^\n+/, ''); // Remove leading empty lines
  }

  // Separate imports from main content
  private separateImports(text: string): { imports: string; mainContent: string } {
    const lines = text.split('\n');
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
      return { imports: '', mainContent: text };
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

  // Load snippet content for a specific tab
  async loadSnippet(tabIndex: number, tab: CodeTab) {
    if (tab.code) {
      const { imports, mainContent } = this.separateImports(tab.code);
      this.setTabContent(tabIndex, {
        text: tab.code,
        path: undefined,
        imports,
        mainContent,
        isExpanded: false,
        isImportsExpanded: false,
        needsExpansion: mainContent.split('\n').length > 15, // Estimate if expansion needed
      });
      return;
    }

    if (!tab.snippet) {
      this.setTabContent(tabIndex, {
        text: '// No content',
        path: undefined,
        error: 'No snippet or code provided',
        imports: '',
        mainContent: '// No content',
        isExpanded: false,
        isImportsExpanded: false,
        needsExpansion: false,
      });
      return;
    }

    try {
      // Use actual file extensions - no .txt convention
      const extension = this.getFileExtension(tab.language);
      const path = tab.folder
        ? `/snippets/${tab.folder}/${tab.snippet}${extension}`
        : `/snippets/${tab.snippet}${extension}`;

      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load snippet: ${tab.snippet} (${response.status})`);
      }

      const text = await response.text();
      const cleanText = this.cleanSnippetText(text);
      const { imports, mainContent } = this.separateImports(cleanText);

      this.setTabContent(tabIndex, {
        text: cleanText,
        path,
        imports,
        mainContent,
        isExpanded: false,
        isImportsExpanded: false,
        needsExpansion: mainContent.split('\n').length > 15, // Estimate if expansion needed
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.setTabContent(tabIndex, {
        text: `// Error loading snippet: ${errorMessage}`,
        path: undefined,
        error: errorMessage,
        imports: '',
        mainContent: `// Error loading snippet: ${errorMessage}`,
        isExpanded: false,
        isImportsExpanded: false,
        needsExpansion: false,
      });
    }
  }

  // Set content for a specific tab
  setTabContent(tabIndex: number, content: TabContent) {
    this.mutate((draft) => {
      if (draft.tabContents[tabIndex]) {
        draft.tabContents[tabIndex] = { ...draft.tabContents[tabIndex], ...content };
      }
    });
  }

  // Toggle expansion state for a specific tab
  toggleExpansion(tabIndex: number) {
    this.mutate((draft) => {
      if (draft.tabContents[tabIndex]) {
        draft.tabContents[tabIndex].isExpanded = !draft.tabContents[tabIndex].isExpanded;
      }
    });
  }

  // Toggle imports expansion for a specific tab
  toggleImportsExpansion(tabIndex: number) {
    this.mutate((draft) => {
      if (draft.tabContents[tabIndex]) {
        draft.tabContents[tabIndex].isImportsExpanded =
          !draft.tabContents[tabIndex].isImportsExpanded;
      }
    });
  }

  // Set needs expansion flag (called from component after DOM measurement)
  setNeedsExpansion(tabIndex: number, needsExpansion: boolean) {
    this.mutate((draft) => {
      if (draft.tabContents[tabIndex]) {
        draft.tabContents[tabIndex].needsExpansion = needsExpansion;
      }
    });
  }

  // Check expansion needs for all tabs with provided DOM elements
  checkExpansionNeeds(elements: (HTMLDivElement | null)[]) {
    this.value.tabContents.forEach((content, index) => {
      if (elements[index] && content.mainContent) {
        const element = elements[index];
        if (element) {
          const scrollHeight = element.scrollHeight;
          const clientHeight = element.clientHeight;
          const needsExpansion = scrollHeight > clientHeight;
          if (needsExpansion !== content.needsExpansion) {
            this.setNeedsExpansion(index, needsExpansion);
          }
        }
      }
    });
  }

  // Create a computation branch for a specific tab
  createTabComputationsBranch(tabIndex: number): TabComputationsBranch {
    const tabContent = this.value.tabContents[tabIndex];
    return new TabComputationsBranch(tabContent);
  }

  // Get computed values for a tab using branch
  getTabComputations(tabIndex: number) {
    const branch = this.createTabComputationsBranch(tabIndex);
    return branch.value;
  }

  // Set active tab index
  setActiveIndex(index: number) {
    this.mutate((draft) => {
      draft.activeIndex = index;
    });
  }

  // Set loading state
  setLoading(loading: boolean) {
    this.mutate((draft) => {
      draft.loading = loading;
    });
  }

  // Load all snippets
  async loadAllSnippets(tabs: CodeTab[]) {
    this.setLoading(true);

    await Promise.all(tabs.map((tab, index) => this.loadSnippet(index, tab)));

    this.setLoading(false);
  }
}

// Factory function for creating CodeTabs stores
export const createCodeTabsStore = (tabs: CodeTab[], defaultIndex: number = 0) => {
  return new CodeTabsForest(tabs, defaultIndex);
};
