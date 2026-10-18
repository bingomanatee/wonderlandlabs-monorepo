import type { ModuleSection } from '../modules';

export function entry(signature: string, description: string) {
  return { signature, description };
}

export const moduleApiPath = (slug: string) =>
  slug === 'forestry4' ? '/api' : `/related-modules/${slug}/api`;

export type ApiSections = ModuleSection[];
