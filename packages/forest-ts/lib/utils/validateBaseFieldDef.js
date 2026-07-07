"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBaseFieldDef = void 0;
const types_coll_data_validators_1 = require("../types/types.coll-data-validators");
const ErrorPlus_1 = require("../ErrorPlus");
const walrus_1 = require("@wonderlandlabs/walrus");
function validateBaseFieldDef(baseFieldDef, key, value, collection) {
    if (!(key in value)) {
        // handle missing values
        if (!baseFieldDef.optional) {
            throw new ErrorPlus_1.ErrorPlus('missing required field ' + key, {
                collection,
                key,
                value
            });
        }
    }
    else {
        // validate value if present
        const fieldValue = value[key];
        if ((0, types_coll_data_validators_1.isDataValidatorFn)(baseFieldDef.validator)) {
            baseFieldDef.validator(fieldValue, collection);
        }
        // validate type if defined
        if (baseFieldDef.type) {
            const fieldType = walrus_1.type.describe(fieldValue, true);
            if (fieldType !== baseFieldDef.type) {
                throw new ErrorPlus_1.ErrorPlus('type mismatch:' + key, {
                    key,
                    expected: baseFieldDef.type,
                    actual: fieldType,
                });
            }
        }
    }
}
exports.validateBaseFieldDef = validateBaseFieldDef;
