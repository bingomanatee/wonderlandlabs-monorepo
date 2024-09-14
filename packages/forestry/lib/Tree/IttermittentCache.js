"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IttermittentCache = exports.CLONE_NAME = void 0;
const types_shared_1 = require("../types/types.shared");
exports.CLONE_NAME = "!BENCHMARK!";
class IttermittentCache {
    static benchmark(tree) {
        if (!tree.top || !tree.params?.cloneInterval) {
            return;
        }
        const { cloneInterval, serializer } = tree.params;
        let check = tree.top;
        let count = 0;
        while (check) {
            if (count >= cloneInterval) {
                const clonedValue = serializer({
                    tree,
                    branch: check,
                    context: types_shared_1.ValueProviderContext.itermittentCache,
                    value: check.value,
                });
                try {
                    const next = tree.top?.add({
                        assert: clonedValue,
                        name: exports.CLONE_NAME,
                    });
                    tree.top = next;
                }
                catch (e) {
                    console.warn("cannot clone! error is ", e);
                }
                return;
            }
            if (check.cause == exports.CLONE_NAME) {
                return;
            }
            count += 1;
            check = check.prev;
        }
    }
}
exports.IttermittentCache = IttermittentCache;
