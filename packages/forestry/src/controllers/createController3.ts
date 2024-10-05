import type { TreeIF, TreeParams } from '../types/types.trees';
import type { ForestIF } from '../types/types.forest';
import { Forest } from '../Forest';

type ActsDo<Acts> = {
  [K in keyof Acts]: OmitThisParameter<Acts[K]>;
};

function createController<Acts>(name: string,
  params: TreeParams<any>,
  actions: Acts,
  forest: ForestIF = new Forest()) {
  type ValueType = typeof params.initial;

  type ActsInput = {
    [K in keyof typeof actions]: (this: TreeIF<ValueType>, ...args: any[]) => any;
  };

  const tree = forest.addTree<ValueType>(name, params as TreeParams<ValueType>);

  const input = actions as ActsInput;

  const doObj = {} as ActsDo<Acts>;
  for (const key in input) {
    const action = input[key];
    (doObj as any)[key] = action.bind(tree);
  }

  return { $tree: tree, ...doObj };
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
const f = createController('foo', { initial: 2 }, actions);

const b = f.bar();      // b is inferred as number
f.multiply(2);   // c is inferred as number
f.multiply(3);
console.log(b); // Output: 33
console.log(f.$tree.value); // Output: 4
