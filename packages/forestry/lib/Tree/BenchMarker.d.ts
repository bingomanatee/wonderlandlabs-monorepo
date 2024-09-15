import type { ChangeIF } from '../types/types.shared';
import type { TreeIF } from '../types/types.trees';
export declare const BENCHMARK_CAUSE = "!BENCHMARK!";
export default class BenchMarker<ValueType> {
    private tree;
    constructor(tree: TreeIF<ValueType>);
    static shouldBenchmark<ValueType>(tree: TreeIF<ValueType>, change: ChangeIF<ValueType>): boolean;
    benchmark(change: ChangeIF<ValueType>): void;
}
