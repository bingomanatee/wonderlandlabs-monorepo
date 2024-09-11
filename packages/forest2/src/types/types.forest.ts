import type { Notable } from './types.shared';
import type { TreeName, TreeIF, TreeParams } from './types.trees';
import type { Observable } from 'rxjs';

export type TaskFn<ResultType> = (forest: ForestIF) => ResultType;

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
  
  uniqueTreeName(basis: string): string;

  do<ResultType>(change: TaskFn<ResultType>): ResultType;

  observe<ValueType>(name: TreeName): Observable<ValueType>;
}
