import type { Notable } from './types.shared';
import type { TreeName, TreeIF, TreeParams } from './types.trees';
import type { Observable } from 'rxjs';

export type TaskFn = (...args: any) => any;

export interface ForestIF extends Notable {
  tree<ValueType>(
    name: TreeName,
    caller?: TreeIF<unknown>
  ): TreeIF<ValueType> | undefined;
  addTree<ValueType>(
    name: TreeName,
    params?: TreeParams<ValueType>
  ): TreeIF<ValueType>;
  hasTree(name: TreeName): boolean;
  treeNames: string[];

  nextTime: number;
  time: number;
  readonly activeTasks: number[];

  uniqueTreeName(basis: string): string;

  do<F extends (...args: any[]) => any>(
    fn: F,
    ...args: Parameters<F>
  ): ReturnType<F>;
  observe<ValueType>(name: TreeName): Observable<ValueType>;
}
