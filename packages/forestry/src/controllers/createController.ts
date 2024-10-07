import type { TreeIF, TreeParams } from '../types/types.trees';
import type { ForestIF } from '../types/types.forest';
import { Forest } from '../Forest';

export type ControllerActions<Acts extends Record<string, (...args: any[]) => any>> = {
  [K in keyof Acts]: OmitThisParameter<Acts[K]>;
};

export function createController<Acts
  extends Record<string, (...args: any[]) => any>>(name: string,
  params: TreeParams<any>,
  actions: Acts ,
  forest: ForestIF = new Forest()) {
  type ValueType = typeof params.initial;

  type ActsInput = {
    [K in keyof typeof actions]: (this: TreeIF<ValueType>, ...args: any[]) => any;
  };

  const tree = forest.addTree<ValueType>(name, params as TreeParams<ValueType>);

  const input = actions as ActsInput;

  const controller = {} as ActsDo<Acts>;
  for (const key in input) {
    const action = input[key];
    if (typeof action === 'function') {
      (controller as any)[key] = action.bind(tree); // Bind each action to the tree
    }
  }

  return { tree, controller };
}



// Example usage
const { tree, controller } = createController('foo', { initial: 2 },
  {
    multiply(this: TreeIF<number>, input: number) {
      this.update((value, input) => value * input, input);
    },
    bar() {
      controller.multiply(5);
      return this.value;
    },
  });

const b = controller.bar();      // b is inferred as number
controller.multiply(2);   // c is inferred as number
controller.multiply(3);
console.log(b); // Output: 33
console.log('tree is now ', tree.value); // Output: 4
