import {
  Collection,
  Forest,
} from '@wonderlandlabs/forestry';
import type { PageDef } from '../pageState.ts';
import { CollectionIF } from '@wonderlandlabs/forestry/build/src/types';

const SECONDS = 1000;
const LONG_DELAY = 5 * SECONDS;
const SHORT_DELAY = 2 * SECONDS;

const f = new Forest();

export type Concept = PageDef;
export type ConceptInfo = {
  concepts: Concept[];
  target: string;
  isLocked: boolean;
};

export class ConceptsState extends Collection<ConceptInfo> {
  constructor(f?: Forest) {
    super(
      'collections',
      {
        initial: {
          concepts: [],
          target: '',
          isLocked: false,
        },
      },
      {
        setIsLocked(
          this: CollectionIF<ConceptInfo>,
          isLocked = true,
        ) {
          this.update((value) => ({
            ...value,
            isLocked: isLocked,
          }));
        },
        addConcept(
          this: CollectionIF<ConceptInfo>,
          concept: Concept,
        ) {
          this.update(
            (value, concept) => ({
              ...value,
              concepts: [
                ...value.concepts,
                concept!,
              ],
            }),
            concept,
          );
        },
        setTarget(
          this: ConceptsState,
          target: string,
        ) {
          this.update(
            (value, seed) => ({
              ...value,
              target: seed ?? '',
            }),
            target,
          );
        },
        rotate(this: ConceptsState) {
          if (
            this.value.isLocked ||
            !this.value.concepts.length
          ) {
            return;
          }

          const currentIndex =
            this.value.concepts.findIndex(
              (c) => c.name === this.value.target,
            );
          const next =
            this.value.concepts[
              currentIndex + 1
            ] || this.value.concepts[0];
          if (!next) return;
          this.update((value) => ({
            ...value,
            target: next.name,
          }));
          this.delay(
            () => this.rotate(),
            SHORT_DELAY,
          );
        },
      },
      f,
    );
  }

  getConcept(name: string) {
    return this.value.concepts.find(
      (c) => c.name === name,
    );
  }

  focus(target: string) {
    this.acts.setTarget(target);
    this.setIsLocked(true);
  }

  blur() {
    this.setIsLocked(false);
    this.delay(() => this.rotate(), SHORT_DELAY);
  }

  rotate() {
    this.acts.rotate();
  }

  setIsLocked(isLocked = true) {
    this.acts.setIsLocked(isLocked);
  }

  init() {
    this.delay(() => this.rotate(), LONG_DELAY);
  }

  #interval?: NodeJS.Timeout;

  delay(
    action: () => unknown,
    delay: number = 0,
  ) {
    clearInterval(this.#interval);
    this.#interval = setTimeout(action, delay);
  }

  static fullUrl(s: string): string {
    return '/concepts/' + s;
  }

  addConcept(concept: Concept) {
    this.acts.addConcept({ ...concept });
  }

  goBack(
    current: string,
    navigate: (target: string) => void,
  ) {
    const index = this.value.concepts.findIndex(
      (c) => c.name === current,
    );
    const prev = this.value.concepts[index - 1];
    this.go(prev, navigate);
  }
  goNext(
    current: string,
    navigate: (target: string) => void,
  ) {
    const index = this.value.concepts.findIndex(
      (c) => c.name === current,
    );
    const prev = this.value.concepts[index + 1];
    this.go(prev, navigate);
  }
  private go(
    target: Concept | undefined,
    navigate: (target: string) => void,
  ) {
    if (target) {
      navigate(
        ConceptsState.fullUrl(target.name),
      );
    } else {
      navigate('/');
    }
  }
}

export const conceptsState = new ConceptsState(f);

conceptsState.addConcept({
  url: '/concepts/transactional',
  name: 'transactional',
  title: 'Transactional',
  blurb: `atomic changes to multiple states`,
  art: '/pictures/transactional.png',
});

conceptsState.addConcept({
  url: '/concepts/journaled',
  name: 'journaled',
  title: 'Journaled',
  blurb: `Inspect and diagnose changes across
  multiple states.`,
  art: '/pictures/journaled.png',
});

conceptsState.addConcept({
  url: '/concepts/observable',
  name: 'observable',
  title: 'Observable',
  blurb: `Built on RxJS for proven subscription patterns and interoperability`,
  art: '/pictures/observable.png',
});

conceptsState.addConcept({
  url: '/concepts/synchronous',
  name: 'synchronous',
  title: 'Synchronous',
  blurb: `Changes occur in real time.`,
  art: '/pictures/synchronous.png',
});

conceptsState.addConcept({
  url: '/concepts/transportable',
  name: 'transportable',
  title: 'Transportable',
  blurb: `State value and actions are contained 
  within single instances, for ease of test and global access.`,
  art: '/pictures/transportable.png',
});

conceptsState.addConcept({
  url: '/concepts/typescript',
  name: 'typescript',
  title: 'Typescripted',
  blurb: `Type-sensitive generators allow methods to reflect state value`,
  art: '/pictures/typescript.png',
});

conceptsState.addConcept({
  url: '/concepts/react',
  name: 'react',
  title: 'Enhances React',
  blurb: `Designed for global or local state, 
  Forestry allows a single-system
  state tool for all scopes of a React application.`,
  art: '/pictures/react.png',
});
