import { Collection } from '@wonderlandlabs/forestry';
import type { CollectionIF } from '@wonderlandlabs/forestry/build/src/types/type.collection';
import type { ReactNode } from 'react';
export type ConceptsLayoutStateValue = {
  title: string;
  image: string;
  summary: string | ReactNode;
};

export const INITIAL = {
  title: '',
  image: '',
  summary: '',
};

export class ConceptsLayoutState extends Collection<ConceptsLayoutStateValue> {
  constructor() {
    super('layout-collection-state', {
      initial: INITIAL,
      actions: new Map([
        [
          'setTitle',
          (coll: CollectionIF<ConceptsLayoutStateValue>, title: string): void => {
            coll.mutate(
              ({ value, seed }) => {
                if (!value) return INITIAL;
                return { ...value, title: seed };
              },
              'setTitle',
              title
            );
          },
        ],
        [
          'setImage',
          (coll: CollectionIF<ConceptsLayoutStateValue>, image: string): void => {
            coll.mutate(
              ({ value, seed }) => {
                if (!value) return INITIAL;
                return { ...value, image: seed };
              },
              'setImage',
              image
            );
          },
        ],
        [
          'setSummary',
          (coll: CollectionIF<ConceptsLayoutStateValue>, summary: string | ReactNode): void => {
            coll.mutate(
              ({ value, seed }) => {
                if (!value) return INITIAL;
                return { ...value, summary: seed };
              },
              'setSummary',
              summary
            );
          },
        ],
      ]),
    });
  }
  setTitle(title: string) {
    this.act('setTitle', title);
  }

  setImage(image: string) {
    this.act('setImage', image);
  }

  setSummary(image: string) {
    this.act('setSummary', image);
  }
}
