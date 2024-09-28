import { Forest } from '@wonderlandlabs/forestry';
import type { SubscribeFn } from '@wonderlandlabs/forestry/build/src/types/types.shared';
import type { TreeIF } from '@wonderlandlabs/forestry/build/src/types/types.trees';
import { debounce } from 'lodash-es';
import type { PartialObserver } from 'rxjs';

const SECONDS = 1000;
const LONG_DELAY = 5 * SECONDS;
const SHORT_DELAY = 2 * SECONDS;

export interface StateIF {
  target: string | null;
  time: number;
  list: string[];
  isLocked: boolean;
}

function setTarget(target: string, isLocked: boolean | null = null) {
  return ({ value }: { value: StateIF }) => {
    return {
      ...value,
      target,
      time: Date.now(),
      isLocked: isLocked === null ? value.isLocked : isLocked,
    };
  };
}

export class State {
  constructor(public tree: TreeIF<StateIF>) {
    this.#init = debounce(() => this.init(), SHORT_DELAY);
  }

  register(target: string) {
    this.tree.mutate(({ value }) => ({
      ...value,
      list: [...value.list, target],
    }));

    this.#init?.();
  }

  handleHover(target: string | null) {
    clearInterval(this.#interval);
    this.tree.mutate(setTarget(target ?? '', true));
  }

  blur() {
    try {
      this.tree.mutate(({ value }) => ({
        ...value,
        isLocked: false,
        target: '',
      }));
    } catch (err) {
      console.log('error:', err);
    }
    this.delay(() => this.rotate(), LONG_DELAY);
  }

  rotate(isLocked = false) {
    if (this.value.isLocked) return;
    const target = this.nextTarget();

    this.tree.mutate(({ value }) => ({
      ...value,
      target,
      time: Date.now(),
      isLocked,
    }));

    this.delay(() => this.rotate(), SHORT_DELAY);
  }

  #interval: any;

  destroy() {
    clearInterval(this.#interval);
  }

  delay(f: () => void, delay: number) {
    clearInterval(this.#interval);
    this.#interval = setInterval(f, delay);
  }

  #init?: () => void;
  init() {
    this.delay(() => this.rotate(), LONG_DELAY);
  }

  nextTarget() {
    const { list, target } = this.tree.value;
    if (!list.length) return '';
    const i = list.findIndex((t) => t === target) + 1;
    if (i >= list.length) return list[0];
    return list[i];
  }
  get value() {
    return this.tree.value;
  }

  subscribe(s: PartialObserver<StateIF> | SubscribeFn<StateIF>) {
    return this.tree.forest.observe(this.tree.name!)?.subscribe(s);
  }
}

export function appState() {
  const f = new Forest();

  const tree = f.addTree<StateIF>('state', {
    initial: { target: null, time: 0, list: [], isLocked: false },
  });

  return new State(tree);
}
