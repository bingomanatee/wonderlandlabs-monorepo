import { CollectionIF } from '../types/types.collections';

export type ControllerActions<
  Acts extends Record<string, (...args: any[]) => any>,
> = {
  [K in keyof Acts]: OmitThisParameter<Acts[K]>;
};

export function collectionActions<ValueType, Acts>(
  collection: CollectionIF<ValueType>,
  actions: Acts
) {
  const acts = {} as ActsDo<Acts>;
  for (const key in actions) {
    const action = actions[key];
    if (typeof action === 'function') {
      const bound = action.bind(collection);
      (acts as any)[key] = function (...args: any[]) {
        return collection.forest.do(bound, ...args);
      } as OmitThisParameter<Acts[Extract<keyof Acts, string>]>;
    }
  }

  return acts;
}
