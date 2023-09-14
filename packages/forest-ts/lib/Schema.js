"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.isSchema = exports.isSchemaProps = void 0;
const walrus_1 = require("@wonderlandlabs/walrus");
const lodash_1 = require("lodash");
const collect_1 = require("@wonderlandlabs/collect");
function isSchemaProps(arg) {
    return walrus_1.type.describe(arg, 'form') === "object" /* FormEnum.object */ && '$type' in arg;
}
exports.isSchemaProps = isSchemaProps;
function isSchema(arg) {
    return walrus_1.type.describe(arg, 'form') === "object" /* FormEnum.object */
        && 'name' in arg && 'options' in arg && arg.$schema === true;
}
exports.isSchema = isSchema;
class Schema {
    constructor(optionsInput, parent) {
        this.optionsInput = optionsInput;
        this.parent = parent;
        this.options = Object.assign(Object.assign({}, optionsInput), { fields: [] });
        if (optionsInput.fields) {
            if (!Array.isArray(optionsInput.fields)) {
                this.options.fields = (0, collect_1.c)(optionsInput.fields).getReduce((memo, props, name) => {
                    memo.push(new Schema(Object.assign(Object.assign({}, props), { name }), this));
                    return memo;
                }, []);
            }
            else {
                this.options.fields = optionsInput.fields.map((field) => {
                    field.parent = this;
                    return field;
                });
            }
        }
    }
    get name() {
        return this.options.name;
    }
    get typeName() {
        return this.options.typescriptName || (0, lodash_1.upperFirst)(this.name);
    }
    get fieldTypescript() {
        return `${this.name}: ${this.typeName}`;
    }
    get fields() {
        return this.options.fields;
    }
    get typescriptField() {
        return `${this.name}: ${this.typeName}.$value`;
    }
    get typescript() {
        return `
      export namespace ${this.typeName} {
        ${this.fields.map(subSchema => subSchema.typescript)
            .join("\n")}
        export type $value = ${this.typescriptDef}
      }
      `;
    }
    get typescriptDef() {
        var _a;
        switch (this.options.$type) {
            case "object" /* TypeEnum.object */:
                if (this.fields) {
                    if (Array.isArray(this.fields)) {
                        if ((_a = this.fields) === null || _a === void 0 ? void 0 : _a.length) {
                            return `{
                ${this.fields.map(schema => schema.typescriptField).join(",\n")}
              }
              `;
                        }
                    }
                }
                return `Record<string, any>`;
                break;
        }
        return `${this.options.$type}`;
    }
}
exports.Schema = Schema;
