"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = extendField;
const types_formCollection_1 = require("./types.formCollection");
const lodash_es_1 = require("lodash-es");
function a(arg) {
    if (Array.isArray(arg)) {
        return arg;
    }
    return [arg];
}
function p(...props) {
    return props.reduce((memo, next) => {
        if (memo && next) {
            return { ...memo, ...next };
        }
        if (next) {
            return next;
        }
        return memo;
    }, {});
}
/**
 *
 * @param  fields passed arrays or individual FieldIFs; may have undefined.
 * passed in most recent to least recent.
 * returns an array favoring more recent values.
 */
function extendField(...fields) {
    const history = fields.flat().reverse();
    const next = history.reduce((out, next) => {
        if (!next) {
            return out;
        }
        const nextOut = { ...out, ...next };
        nextOut.props = p(out.props, next.props);
        return nextOut;
    }, { name: '', value: '' });
    if (next.baseParams) {
        const { baseParams, ...rest } = next;
        return extendField(rest, baseParams);
    }
    if (!(0, types_formCollection_1.isFieldIF)(next)) {
        console.log('bad field ', next);
        throw new Error('extendField cannot produce a complete fieldIF');
    }
    delete next.baseParams;
    return applyValidators(next);
}
function applyValidators(field) {
    if (field.validators) {
        const errors = a(field.validators)
            .reduce((errs, v) => {
            let e;
            try {
                e = v(field, errs) || undefined;
                if (e) {
                    errs.push(e);
                }
            }
            catch (er) {
                if (er instanceof Error) {
                    errs.push({
                        message: er.message,
                        severity: Number.MAX_SAFE_INTEGER - 1,
                    });
                }
                else {
                    errs.push({ message: `${er}`, severity: Number.MAX_SAFE_INTEGER });
                }
            }
            return errs;
        }, [])
            .filter(Boolean);
        if (errors) {
            field.errors = (0, lodash_es_1.uniqWith)(errors, lodash_es_1.isEqual);
        }
        else {
            delete field.errors;
        }
    }
    else {
        delete field.errors;
    }
    return field;
}
