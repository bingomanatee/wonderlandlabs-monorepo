"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
class Field {
    constructor(input) {
        this.tree = input.tree;
        this.name = input.name;
        this.value = input.value;
        this.params = [this.defaultParams, input.params].reduce((out, input) => {
            if ((0, types_1.isObj)(input)) {
                return { ...out, ...input };
            }
            return out;
        }, {});
    }
    get defaultParams() {
        let defaultParams;
        let fields = this.tree?.engineInput
            ? this.tree.engineInput.fields
            : undefined;
        if (fields) {
            if (fields.has(name)) {
                defaultParams = fields.get(name).params;
            }
        }
        return undefined;
    }
}
exports.default = Field;
