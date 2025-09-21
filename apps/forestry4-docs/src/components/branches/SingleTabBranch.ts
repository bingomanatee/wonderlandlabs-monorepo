// Single Tab Branch subclass with all tab-specific logic
import React from 'react';
import { Forest } from '@wonderlandlabs/forestry4';

export class SingleTabBranch extends Forest<any> {
  constructor(
    config: any,
    private tabIndex: number
  ) {
    super(config);
  }

  // Computed properties
  get hasImports(): boolean {
    return this.value?.imports && this.value.imports.trim().length > 0;
  }

  get hasMainContent(): boolean {
    return this.value?.mainContent && this.value.mainContent.trim().length > 0;
  }

  get displayContent(): string {
    return this.hasImports && this.hasMainContent
      ? `${this.value.imports}\n\n${this.value.mainContent}`
      : this.value?.text || '// Loading...';
  }

  get importCount(): number {
    return (
      this.value?.imports?.split('\n').filter((line: string) => line.trim().startsWith('import'))
        .length || 0
    );
  }

  get fullContent(): string {
    return this.value.imports && this.value.mainContent
      ? `${this.value.imports}\n\n${this.value.mainContent}`
      : this.value.text;
  }

  // Actions - handle locally
  toggleExpansion() {
    this.mutate((draft) => {
      draft.isExpanded = !draft.isExpanded;
    });
  }

  toggleImportsExpansion(e) {
    this.mutate((draft) => {
      draft.isImportsExpanded = !draft.isImportsExpanded;
    });
  }

  // Check if content needs expansion based on DOM measurements
  checkExpansionNeeds(contentRef: React.RefObject<HTMLDivElement>) {
    if (contentRef?.current) {
      const element = contentRef.current;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
      const needsExpansion = scrollHeight > clientHeight;

      if (needsExpansion !== this.value.needsExpansion) {
        this.mutate((draft) => {
          draft.needsExpansion = needsExpansion;
        });
      }
    }
  }

  async copyToClipboard(): Promise<{ success: boolean; message: string }> {
    try {
      await navigator.clipboard.writeText(this.fullContent);
      return { success: true, message: 'Full code copied to clipboard' };
    } catch (err) {
      return { success: false, message: 'Failed to copy' };
    }
  }
}
