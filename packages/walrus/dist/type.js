import { FormEnum, TypeEnum, TypeofEnum, NumberEnum } from "./enums.js";
class TypeDef {
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
    if ([FormEnum.scalar, FormEnum.void, FormEnum.function].includes(this.form)) {
      return this.form;
    }
    return FormEnum.container;
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
    return true;
  }
}
const types = [
  new TypeDef(TypeEnum.undefined, FormEnum.void, TypeofEnum.undefined),
  new TypeDef(TypeEnum.null, FormEnum.void, TypeofEnum.object, (s) => s === null),
  new TypeDef(TypeEnum.boolean, FormEnum.scalar, TypeofEnum.boolean),
  new TypeDef(TypeEnum.string, FormEnum.scalar, TypeofEnum.string),
  new TypeDef(TypeEnum.number, FormEnum.scalar, TypeofEnum.number),
  new TypeDef(TypeEnum.number, FormEnum.scalar, TypeofEnum.bigint),
  new TypeDef(TypeEnum.symbol, FormEnum.scalar, TypeofEnum.symbol),
  new TypeDef(TypeEnum.function, FormEnum.function, TypeofEnum.function),
  new TypeDef(TypeEnum.array, FormEnum.array, TypeofEnum.object, (v) => Array.isArray(v)),
  new TypeDef(TypeEnum.map, FormEnum.map, TypeofEnum.object, (m) => m instanceof Map),
  new TypeDef(TypeEnum.set, FormEnum.set, TypeofEnum.object, (s) => s instanceof Set),
  new TypeDef(
    TypeEnum.object,
    FormEnum.object,
    TypeofEnum.object,
    (o) => o && typeof o === "object"
  )
];
function typeToForm(type) {
  const d = types.find((d2) => d2.type === type);
  return d?.form || FormEnum.void;
}
const describe = (value, reflect = false) => {
  if (reflect) {
    const t = describe(value);
    if (typeof t === "object") {
      if (reflect === true) {
        return t.type;
      }
      if (reflect === "type" || reflect === "form" || reflect === "typeOf" || reflect === "family") {
        return t[reflect];
      }
    }
    return t;
  }
  const type = typeof value;
  for (let i = 0; i < types.length; ++i) {
    const def = types[i];
    if (def.includes(value, type)) {
      return def;
    }
  }
  console.error("describe failure to analyze", value);
  throw new Error("cannot analyze value");
};
const describeNumber = (value) => {
  if (["number", "bigint"].includes(typeof value)) {
    if (Number.isFinite(value)) {
      if (Number.isInteger(value)) {
        return NumberEnum.integer;
      } else {
        return NumberEnum.decimal;
      }
    } else {
      return NumberEnum.infinite;
    }
  }
  return NumberEnum.nan;
};
export {
  TypeDef,
  describe,
  describeNumber,
  typeToForm,
  types
};
//# sourceMappingURL=type.js.map
