import { Collection } from '@wonderlandlabs/forestry';
import { CollectionIF } from '@wonderlandlabs/forestry/build/src/types';

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
class SectionsCollection extends Collection<Sections> {
  constructor() {
    super(
      'sections',
      {
        initial: { sections: [], current: '' },
      },
      {
        addSection(this: CollectionIF<Sections>, s: PageDef) {
          this.update((value, newSection) => {
            const newValue: Sections = { ...value };
            newValue.sections = [...value.sections, newSection];
            return newValue;
          }, s);
        },
      }
    );
  }
  currentPage(this: CollectionIF<Sections>) {
    if (!this.value.current) return undefined;
    return this.value.sections.find((p) => {
      return p.name === this.value.current;
    });
  }
}

export const sectionsState = new SectionsCollection();

sectionsState.acts.addSection({
  art: '/pictures/api.png',
  icon: '/pictures/icons/api.png',
  url: '/api',
  name: 'api',
  blurb: 'How to use Forestry',
  title: 'Forestry API',
});

sectionsState.acts.addSection({
  art: '/pictures/getting-started.png',
  url: '/getting-started',
  name: 'start',
  blurb: 'Up and running with Forestry',
  icon: '/pictures/icons/getting-started.png',
  title: 'Getting Started',
});
