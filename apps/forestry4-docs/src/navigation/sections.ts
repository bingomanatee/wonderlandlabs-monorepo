import { readWritePath } from '../pages/related/ReadWriteArchitecture';
import {
  relatedModules,
  relatedPath,
  relatedRoot,
} from '../pages/related/modules';
import { moduleApiPath } from '../pages/related/api/shared';

export interface NavigationItem {
  label: string;
  path: string;
}

export interface NavigationSection {
  label: string;
  title: string;
  path: string;
  items: NavigationItem[];
}

export const navigationSections: NavigationSection[] = [
  {
    label: 'Start',
    title: 'Getting Started',
    path: '/start',
    items: [
      { label: 'Quick Start', path: '/' },
      { label: 'Why Forestry?', path: '/why' },
    ],
  },
  {
    label: 'Features',
    title: 'Essential Features',
    path: '/features',
    items: [
      { label: 'Basics', path: '/forest' },
      { label: 'Value Change', path: '/change' },
      { label: 'With React', path: '/react' },
      { label: 'Other Frameworks', path: '/other-frameworks' },
    ],
  },
  {
    label: 'Tools',
    title: 'Power Tools',
    path: '/tools',
    items: [
      { label: 'Branching', path: '/branching' },
      { label: 'Validation', path: '/validation' },
      { label: 'Schema', path: '/schemas' },
      { label: 'Transactions', path: '/transactions' },
      { label: 'Bound Methods', path: '/bound-methods' },
      { label: 'RxJS / Immer', path: '/rxjs' },
      { label: 'Read / Write Layers', path: readWritePath },
    ],
  },
  {
    label: 'Examples',
    title: 'Practical Examples',
    path: '/guides/examples',
    items: [
      { label: 'Overview', path: '/examples' },
      { label: 'Todo App', path: '/examples/todo-app' },
      { label: 'Shopping Cart', path: '/examples/shopping-cart' },
      { label: 'Form Validation', path: '/examples/form-validation' },
      { label: 'Transaction Demo', path: '/examples/transaction-demo' },
    ],
  },
  {
    label: 'Modules',
    title: 'Related Modules',
    path: '/modules',
    items: [
      { label: 'Overview', path: relatedRoot },
      ...relatedModules.map((module) => ({
        label: module.title,
        path: relatedPath(module),
      })),
    ],
  },
  {
    label: 'API',
    title: 'API Reference',
    path: '/reference',
    items: [
      { label: 'Overview', path: '/api' },
      { label: 'Changelog', path: '/changelog' },
      { label: 'Forest Class', path: '/api#forest' },
      { label: 'Constructor & Properties', path: '/api#forest-constructor' },
      { label: 'Core Methods', path: '/api#forest-core' },
      { label: 'Branching Methods', path: '/api#forest-branching' },
      { label: 'Transactions', path: '/api#forest-transactions' },
      { label: 'Validation', path: '/api#forest-validation' },
      { label: 'Types', path: '/api#types-config' },
      ...relatedModules.map((module) => ({
        label: `${module.title} API`,
        path: moduleApiPath(module.slug),
      })),
    ],
  },
];

export const sourceUrl =
  'https://github.com/bingomanatee/wonderlandlabs-monorepo/' +
  'tree/main/packages/forestry4';
