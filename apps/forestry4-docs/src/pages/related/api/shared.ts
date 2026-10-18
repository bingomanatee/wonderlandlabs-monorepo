import type { ModuleSection } from '../modules';

export function entry(signature: string, description: string) {
  return { signature, description };
}

export const moduleApiPath = (slug: string) =>
  `/related-modules/${slug}/api`;

export type ApiSections = ModuleSection[];
