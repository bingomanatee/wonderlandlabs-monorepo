import { Collection } from '@wonderlandlabs/forestry';

export type PageDef = {
  name: string;
  title: string;
  blurb: string;
  icon?: string;
  url?: string;
  art: string;
};

type Sections = {
  sections: PageDef[];
  current: string;
};
class SectionsCollection extends Collection<Sections, SectionsCollection> {
  constructor() {
    super('sections', {
      initial: { sections: [], current: '' },
      revisions: {
        addSection(value: Sections, s: PageDef) {
          const newValue: Sections = { ...value };
          newValue.sections = [...value.sections, s];
          return newValue;
        },
      },
    });
  }
  currentPage() {
    if (!this.value.current) return undefined;
    return this.value.sections.find((p) => {
      p.name === this.value.current;
    });
  }
}

export const sectionsState = new SectionsCollection();

sectionsState.revise<PageDef>('addSection', {
  art: '/pictures/api.png',
  icon: '/pictures/icons/api.png',
  url: '/api',
  name: 'api',
  blurb: 'How to use Forestry',
  title: 'Forestry API',
});

sectionsState.revise<PageDef>('addSection', {
  art: '/pictures/getting-started.png',
  url: '/getting-started',
  name: 'start',
  blurb: 'Up and running with Forestry',
  icon: '/pictures/icons/getting-started.png',
  title: 'Getting Started',
});
