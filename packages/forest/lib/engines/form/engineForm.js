"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.engineForm = void 0;
const constants_1 = require("../../constants");
const types_1 = require("../../types");
const Engine_1 = __importDefault(require("../Engine"));
const Field_1 = __importDefault(require("./Field"));
const Form_1 = require("./Form");
const Form_types_1 = require("./Form.types");
function isKeyVal(a) {
    return (0, types_1.isObj)(a) && "key" in a && "val" in a;
}
function setActionFactory(engine) {
    const action = {
        name: "set",
        cacheable: true,
        mutator(branch, args) {
            const tree = branch.tree;
            const [name, val, params] = args;
            if (!branch.prev)
                throw new Error("set must have prev");
            const { form, fields } = branch.prev.value;
            if ((0, Form_types_1.isFieldIF)(val)) {
                fields.set(name, val);
            }
            else if (!fields.has(name)) {
                // generate new field
                if ((0, Form_types_1.isFieldPairIF)(val) || (0, Form_types_1.isFieldValue)(val)) {
                    fields.set(name, new Field_1.default({ tree: branch.tree, value: val, name, params }));
                }
                else if ((0, Form_types_1.isFieldIF)(val)) {
                    fields.set(name, val);
                }
                else {
                    throw new Error("bad set value");
                }
            }
            else {
                // mpdify existing field
                const oldField = fields.get(name);
                const newParams = params || {};
                const mergedParams = oldField.params
                    ? { ...oldField.params, ...newParams }
                    : { ...newParams };
                fields.set(name, new Field_1.default({ tree, name, value: val, params: mergedParams }));
            }
            return {
                form,
                fields: new Map(fields),
            };
        },
    };
    return action;
}
function deleteActionFactory(engine) {
    const action = {
        name: "delete",
        cacheable: true,
        mutator: function (branch, args) {
            const fieldNames = args.flat();
            const fields = branch.value.fields;
            const newFields = new Map(fields);
            fieldNames.forEach((name) => {
                // @ts-ignore
                if (newFields.has(name)) {
                    // @ts-ignore
                    newFields.delete(name);
                }
            });
        },
    };
    return action;
}
/**
 * modifies fields with an updated field, with the new props
 * @param fields
 * @param name
 * @param propOrObj
 * @param value
 * @returns
 */
function blendFieldProps(fields, name, propOrObj, value) {
    if (!fields.has(name))
        return {};
    if (typeof propOrObj === "string") {
        return blendFieldProps(fields, name, { [propOrObj]: value });
    }
    else if ((0, types_1.isObj)(propOrObj)) {
        const field = fields.get(name);
        const { params } = field;
        const newParams = params ? { ...params, ...propOrObj } : { ...propOrObj };
        const newField = new Field_1.default({
            name,
            value: field.value,
            tree: field.tree,
            params: newParams,
        });
        fields.set(name, newField);
    }
    else {
        throw new Error("bad argument to blendFieldProps");
    }
}
function updateFieldProps(engine) {
    const action = {
        name: "updaeFieldProps",
        mutator(branch, args) {
            const [nameOrNames, propOrObj, value] = args;
            if (typeof nameOrNames === "string") {
                return action.mutator(branch, [[nameOrNames], ...args.slice(1)]);
            }
            if (Array.isArray(nameOrNames)) {
                const { fields, form } = branch.value;
                for (const name of nameOrNames) {
                    if (typeof name !== "string") {
                        throw new Error("setFieldProp -- name must be string or string[]");
                        if (fields.has(name)) {
                            blendFieldProps(fields, name, propOrObj, value);
                        }
                    }
                }
                return { fields: new Map(fields), form };
            }
            throw new Error("cannot update field props");
        },
    };
    return action;
}
function updateForm(engine) {
    const action = {
        name: "updateForm",
        mutator(branch, args) {
            const [propOrObj, value] = args;
            const { fields, form } = branch.value;
            if (typeof propOrObj === "string") {
                const newForm = new Form_1.Form({ ...form, [propOrObj]: value });
                return { form: newForm, fields };
            }
            else if ((0, types_1.isObj)(propOrObj)) {
                const newForm = new Form_1.Form({ ...form, ...propOrObj });
                return { form: newForm, fields };
            }
            else {
                throw new Error("bad format for updateForm");
            }
        },
    };
    return action;
}
exports.engineForm = {
    name: "map",
    factory(tree) {
        const engine = new Engine_1.default("map", {
            cacheable: constants_1.CACHE_TOP_ONLY,
            validator(value) {
                if (!(0, Form_types_1.isFormAndFieldsIF)(value)) {
                    throw new Error("form engine requires form and fields");
                }
            },
        });
        engine.addAction(setActionFactory(engine));
        engine.addAction(deleteActionFactory(engine));
        engine.addAction(updateFieldProps(engine));
        engine.addAction(updateForm(engine));
        return engine;
    },
};
