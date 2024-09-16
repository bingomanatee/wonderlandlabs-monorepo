"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenchMarker = exports.BENCHMARK_CAUSE = void 0;
const types_guards_1 = require("../types/types.guards");
const ValueProviderContext_1 = require("../types/ValueProviderContext");
exports.BENCHMARK_CAUSE = '!BENCHMARK!';
class BenchMarker {
    tree;
    constructor(tree) {
        this.tree = tree;
    }
    static shouldBenchmark(tree, change) {
        if (change.name === exports.BENCHMARK_CAUSE) {
            return false;
        }
        if (!tree.params) {
            return false;
        }
        const { benchmarkInterval, serializer } = tree.params;
        if (!serializer) {
            return false;
        }
        let isBenchmarked = false;
        let count;
        tree.forEachDown((b, c) => {
            if (b.cause === exports.BENCHMARK_CAUSE) {
                isBenchmarked = true;
                return true;
            }
            count = c;
        }, benchmarkInterval);
        if (count < benchmarkInterval - 1) {
            return false;
        }
        return !isBenchmarked;
    }
    benchmark(change) {
        const { serializer } = this.tree.params;
        if ((0, types_guards_1.isMutator)(change)) {
            const next = change.mutator({
                branch: this.tree.top,
                value: this.tree.top?.value,
                tree: this.tree,
                seed: change.seed,
                context: ValueProviderContext_1.ValueProviderContext.mutation,
            });
            const serialized = serializer({
                value: next,
                branch: this.tree.top,
                tree: this.tree,
                context: ValueProviderContext_1.ValueProviderContext.itermittentCache,
            });
            this.tree.next(serialized, exports.BENCHMARK_CAUSE);
        }
        else if ((0, types_guards_1.isAssert)(change)) {
            const serialized = serializer({
                value: change.assert,
                tree: this.tree,
                branch: this.tree.top,
                context: ValueProviderContext_1.ValueProviderContext.itermittentCache,
            });
            this.tree.next(serialized, exports.BENCHMARK_CAUSE);
        }
        this.tree.addNote('benchmark serialized ' + change.name);
    }
}
exports.BenchMarker = BenchMarker;
