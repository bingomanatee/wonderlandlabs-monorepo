import type { TreeIF, TreeParams } from './types/types.trees';
import { Tree } from './Tree';
import type { ForestIF } from './types/types.forest';
import { Forest } from './Forest';

type ActsInput<ValueType, Acts> = {
  [K in keyof Acts]: (this: TreeIF<ValueType>, ...args: any[]) => any;
};

type ActsDo<Acts> = {
  [K in keyof Acts]: OmitThisParameter<Acts[K]>;
};

interface ActorIF<ValueType, Acts> {
  do: ActsDo<Acts>;
  $tree: TreeIF<ValueType>
}

function createDo<ValueType, Acts extends ActsInput<ValueType, Acts>>(
  actor: ActorIF<ValueType, Acts>,
  actions: Acts
): ActsDo<Acts> {
  const doObj = {} as ActsDo<Acts>;
  for (const key in actions) {
    const action = actions[key];
    (doObj as any)[key] = action.bind(actor.$tree);
  }
  return doObj;
}

class Controller<ValueType, Acts extends ActsInput<ValueType, Acts>> implements ActorIF<ValueType, Acts> {
  public $tree: TreeIF<ValueType>;
  constructor(name: string,
              public params: TreeParams<ValueType>,
              actions: Acts,
              public forest: ForestIF = new Forest()) {
    this.$tree = new Tree(forest, name, params);
    Object.assign(this, createDo<ValueType, typeof actions>(this, actions));
  }

  public do: ActsDo<Acts>;

  get value() {
    return this.$tree.value;
  }
}

const actions = {
  multiply(this: TreeIF<number>, input: number) {
    this.update((value, input) => value * input, input);
  },
  bar(this: TreeIF<number>) {
    return 'foo';
  },
};
// Example usage
const f = new Controller<number, typeof actions>('foo', { initial: 1 }, actions)

const b = f.do.bar();      // b is inferred as number
f.do.multiply(2);   // c is inferred as number

console.log(b); // Output: 33
console.log(f.value); // Output: 4
