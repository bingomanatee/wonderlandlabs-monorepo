import { dataCoreApi } from './dataCore';
import { connectionsApi } from './connections';
import { hooksApi } from './hooks';
import { fileProviderApi } from './fileProvider';
import type { ApiSections } from './shared';

export const moduleApiSections: Record<string, ApiSections> = {
  'data-core': dataCoreApi,
  connections: connectionsApi,
  'react-hooks': hooksApi,
  'file-provider': fileProviderApi,
};
