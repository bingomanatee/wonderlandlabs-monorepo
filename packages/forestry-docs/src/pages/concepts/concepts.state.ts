import { Collection, Forest } from '@wonderlandlabs/forestry';
import type { PageDef } from '../sections.state';

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
        initial: { concepts: [], target: '', isLocked: false },
        actions: {
          setIsLocked(concepts, isLocked = true) {
            concepts.update<boolean>((value) => ({ ...value, isLocked: !!isLocked }));
          },
          addConcept(concepts, concept: Concept) {
            concepts.update<Concept>(
              (value, concept) => ({
                ...value,
                concepts: [...value.concepts, concept!],
              }),
              concept
            );
          },
          setTarget(concepts, target: string) {
            concepts.mutate<string>(
              ({ value, seed }) => ({
                ...value,
                target: seed ?? '',
              }),
              target,
              'addTarget'
            );
          },
          rotate(concepts) {
            if (concepts.value.isLocked || !concepts.value.concepts.length) {
              return;
            }

            const currentIndex = concepts.value.concepts.findIndex(
              (c) => c.name === concepts.value.target
            );
            const next = concepts.value.concepts[currentIndex + 1] || concepts.value.concepts[0];
            if (!next) return;
            concepts.mutate(({ value }) => ({ ...value, target: next.name }));
            const state = concepts as ConceptsState;

            state.delay(() => state.rotate(), SHORT_DELAY);
          },
        },
      },
      f
    );
  }

  getConcept(name: string) {
    console.log('looking for ', name, 'in', this.value.concepts);
    return this.value.concepts.find((c) => c.name === name);
  }

  focus(target: string) {
    this.act('setTarget', target);
    this.setIsLocked(true);
  }

  blur() {
    this.setIsLocked(false);
    this.delay(() => this.rotate(), SHORT_DELAY);
  }

  rotate() {
    this.act('rotate');
  }

  setIsLocked(isLocked = true) {
    this.act('setIsLocked', isLocked);
  }

  init() {
    this.delay(() => this.rotate(), LONG_DELAY);
  }

  #interval: any;

  delay(action: () => any, delay: number = 0) {
    clearInterval(this.#interval);
    this.#interval = setTimeout(action, delay);
  }

  static fullUrl(s: string): string {
    return '/concepts/' + s;
  }

  addConcept(concept: Concept) {
    this.act('addConcept', { ...concept });
  }

  goBack(current: string, navigate: (target: string) => void) {
    const index = this.value.concepts.findIndex((c) => c.name === current);
    const prev = this.value.concepts[index - 1];
    this.go(prev, navigate);
  }
  goNext(current: string, navigate: (target: string) => void) {
    const index = this.value.concepts.findIndex((c) => c.name === current);
    const prev = this.value.concepts[index + 1];
    this.go(prev, navigate);
  }
  private go(target: Concept | undefined, navigate: (target: string) => void) {
    if (target) {
      navigate(ConceptsState.fullUrl(target.name));
    } else {
      navigate('/');
    }
  }
}

export const conceptsState = new ConceptsState(f);

conceptsState.addConcept({
  name: 'transactional',
  title: 'Transactional',
  blurb: `Actions are either fully executed, 
  or revert to the previous state`,
  art: '/pictures/transactional.png',
});

conceptsState.addConcept({
  name: 'journaled',
  title: 'Journaled',
  blurb: `Every change and action is logged and timestamped, 
  even across multiple state collections,
   for easy diagnosis.`,
  art: '/pictures/journaled.png',
});

conceptsState.addConcept({
  name: 'observable',
  title: 'Observable',
  blurb: `Built on RxJS, Forestry allows for observation 
  of changes system wide as well as piping to all
      RxJS modifiers.`,
  art: '/pictures/observable.png',
});

conceptsState.addConcept({
  name: 'synchronous',
  title: 'Synchronous',
  blurb: `Changes occur in real time.`,
  art: '/pictures/synchronous.png',
});

conceptsState.addConcept({
  name: 'transportable',
  title: 'Transportable',
  blurb: ` State value and actions are contained 
  within single instances, for ease of test and global access.`,
  art: '/pictures/transportable.png',
});

conceptsState.addConcept({
  name: 'typescript',
  title: 'Typescript Friendly',
  blurb: `Forestry classes and methods can be keyed to define 
  the type of value managed by the state.`,
  art: '/pictures/typescript.png',
});

conceptsState.addConcept({
  name: 'react',
  title: 'Enhances React Development',
  blurb: `Designed for global or local state, 
  Forestry allows a single-system
  state tool for all scopes of a React application.`,
  art: '/pictures/react.png',
});
