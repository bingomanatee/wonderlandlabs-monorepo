export const relatedRoot = '/related-modules';

export interface ModuleSection {
  title: string;
  paragraphs: string[];
  methods?: {
    signature: string;
    description: string;
  }[];
  code?: string;
  language?: string;
}

export interface RelatedModule {
  slug: string;
  title: string;
  packageName: string;
  summary: string;
}

export const companionModules: RelatedModule[] = [
  {
    slug: 'data-core',
    title: 'DataCore',
    packageName: '@wonderlandlabs/forestry-data-core',
    summary: 'Validated record collections stored in Forestry branches.',
  },
  {
    slug: 'connections',
    title: 'Data Connections',
    packageName: '@wonderlandlabs/forestry-data-core',
    summary: 'Ordered data-source fallback for REST and socket transports.',
  },
  {
    slug: 'react-hooks',
    title: 'React Hooks',
    packageName: '@wonderlandlabs/forestry4-hooks',
    summary: 'Observe existing stores or give components their own store.',
  },
  {
    slug: 'file-provider',
    title: 'FileProvider',
    packageName: '@timothyopensource/fileprovider',
    summary: 'Switchable file storage with promise and RxJS APIs.',
  },
];

export const relatedModules: RelatedModule[] = [
  {
    slug: 'forestry4',
    title: 'Forestry 4',
    packageName: '@wonderlandlabs/forestry4',
    summary: 'The core state manager behind DataCore and React Hooks, with '
      + 'observable stores, branches, validation, and transactions.',
  },
  ...companionModules,
];

export const relatedPath = (module: RelatedModule) =>
  module.slug === 'forestry4' ? '/' : `${relatedRoot}/${module.slug}`;
