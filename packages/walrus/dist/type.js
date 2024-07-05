"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describeNumber =
  exports.describe =
  exports.typeToForm =
  exports.types =
  exports.TypeDef =
    void 0;
const enums_1 = require("./enums");
class TypeDef {
  type;
  form;
  typeOf;
  test;
  constructor(type, form, typeOf, test) {
    this.type = type;
    this.form = form;
    this.typeOf = typeOf;
    this.test = test;
  }
  /**
   * A very flat subspecies of FormEnum -- includes either 'void', 'scalar', 'function', or 'container'
   */
  get family() {
    if (
      [
        enums_1.FormEnum.scalar,
        enums_1.FormEnum.void,
        enums_1.FormEnum.function,
      ].includes(this.form)
    ) {
      return this.form;
    }
    return enums_1.FormEnum.container;
  }
  includes(value, typeOf) {
    if (!typeOf) {
      return this.includes(value, typeof value);
    }
    if (typeOf !== this.typeOf) {
      return false;
    }
    if (this.test && !this.test(value)) {
      return false;
    }
    return true; // same type as typeof, and no test to fail OR passed test
  }
}
exports.TypeDef = TypeDef;
exports.types = [
  new TypeDef(
    enums_1.TypeEnum.undefined,
    enums_1.FormEnum.void,
    enums_1.TypeofEnum.undefined,
  ),
  new TypeDef(
    enums_1.TypeEnum.null,
    enums_1.FormEnum.void,
    enums_1.TypeofEnum.object,
    (s) => s === null,
  ),
  new TypeDef(
    enums_1.TypeEnum.boolean,
    enums_1.FormEnum.scalar,
    enums_1.TypeofEnum.boolean,
  ),
  new TypeDef(
    enums_1.TypeEnum.string,
    enums_1.FormEnum.scalar,
    enums_1.TypeofEnum.string,
  ),
  new TypeDef(
    enums_1.TypeEnum.number,
    enums_1.FormEnum.scalar,
    enums_1.TypeofEnum.number,
  ),
  new TypeDef(
    enums_1.TypeEnum.number,
    enums_1.FormEnum.scalar,
    enums_1.TypeofEnum.bigint,
  ),
  new TypeDef(
    enums_1.TypeEnum.symbol,
    enums_1.FormEnum.scalar,
    enums_1.TypeofEnum.symbol,
  ),
  new TypeDef(
    enums_1.TypeEnum.function,
    enums_1.FormEnum.function,
    enums_1.TypeofEnum.function,
  ),
  new TypeDef(
    enums_1.TypeEnum.array,
    enums_1.FormEnum.array,
    enums_1.TypeofEnum.object,
    (v) => Array.isArray(v),
  ),
  new TypeDef(
    enums_1.TypeEnum.map,
    enums_1.FormEnum.map,
    enums_1.TypeofEnum.object,
    (m) => m instanceof Map,
  ),
  new TypeDef(
    enums_1.TypeEnum.set,
    enums_1.FormEnum.set,
    enums_1.TypeofEnum.object,
    (s) => s instanceof Set,
  ),
  new TypeDef(
    enums_1.TypeEnum.object,
    enums_1.FormEnum.object,
    enums_1.TypeofEnum.object,
    (o) => o && typeof o === "object",
  ),
];
function typeToForm(type) {
  const d = exports.types.find((d) => d.type === type);
  return d?.form || enums_1.FormEnum.void;
}
exports.typeToForm = typeToForm;
const describe = (value, reflect = false) => {
  if (reflect) {
    const t = (0, exports.describe)(value);
    if (typeof t === "object") {
      if (reflect === true) {
        return t.type;
      }
      if (
        reflect === "type" ||
        reflect === "form" ||
        reflect === "typeOf" ||
        reflect === "family"
      ) {
        return t[reflect];
      }
    }
    return t;
  }
  const type = typeof value;
  for (let i = 0; i < exports.types.length; ++i) {
    const def = exports.types[i];
    if (def.includes(value, type)) {
      return def;
    }
  }
  console.error("describe failure to analyze", value);
  throw new Error("cannot analyze value");
};
exports.describe = describe;
const describeNumber = (value) => {
  if (["number", "bigint"].includes(typeof value)) {
    if (Number.isFinite(value)) {
      if (Number.isInteger(value)) {
        return enums_1.NumberEnum.integer;
      } else {
        return enums_1.NumberEnum.decimal;
      }
    } else {
      return enums_1.NumberEnum.infinite;
    }
  }
  return enums_1.NumberEnum.nan;
};
exports.describeNumber = describeNumber;
