"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreValidator = void 0;
const types_guards_1 = require("../types/types.guards");
const ValueProviderContext_1 = require("../types/ValueProviderContext");
class PreValidator {
    static validate(change, tree) {
        if ((0, types_guards_1.isAssert)(change)) {
            const nextValue = change.assert;
            const test = tree.validate(nextValue);
            if (!test.isValid) {
                throw new Error(test.error ?? 'invalid value');
            }
        }
        else if ((0, types_guards_1.isMutator)(change)) {
            const value = tree.top?.value;
            const nextValue = change.mutator({
                value,
                branch: tree.top,
                seed: change.seed,
                tree,
                context: ValueProviderContext_1.ValueProviderContext.mutation,
            });
            const test = tree.validate(nextValue);
            if (!test.isValid) {
                throw new Error(test.error ?? 'invalid value');
            }
        }
        else {
            console.warn('bad change: ', change);
        }
    }
}
exports.PreValidator = PreValidator;
