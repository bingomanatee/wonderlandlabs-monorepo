import {
  FormEnum,
  NumberEnum,
  NumberEnumType,
  TypeEnum,
  TypeofEnum,
} from './enums';
import type { TypeEnumType, FormEnumType } from './enums';

type testFn = (value: any) => boolean;

export class TypeDef {
  constructor(
    public readonly type: TypeEnumType,
    public readonly form: FormEnumType,
    public readonly typeOf: TypeEnumType,
    private test?: testFn
  ) {}

  /**
   * A very flat subspecies of FormEnum -- includes either 'void', 'scalar', 'function', or 'container'
   */
  get family() {
    if (
      [ FormEnum.scalar, FormEnum.void, FormEnum.function ].includes(this.form)
    ) {
      return this.form;
    }
    return FormEnum.container;
  }

  includes(value: any, typeOf?: TypeEnumType | string): boolean {
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

export const types: TypeDef[] = [
  new TypeDef(TypeEnum.undefined, FormEnum.void, TypeofEnum.undefined),
  new TypeDef(
    TypeEnum.null,
    FormEnum.void,
    TypeofEnum.object,
    (s) => s === null
  ),
  new TypeDef(TypeEnum.boolean, FormEnum.scalar, TypeofEnum.boolean),
  new TypeDef(TypeEnum.string, FormEnum.scalar, TypeofEnum.string),
  new TypeDef(TypeEnum.number, FormEnum.scalar, TypeofEnum.number),
  new TypeDef(TypeEnum.number, FormEnum.scalar, TypeofEnum.bigint),
  new TypeDef(TypeEnum.symbol, FormEnum.scalar, TypeofEnum.symbol),
  new TypeDef(TypeEnum.function, FormEnum.function, TypeofEnum.function),
  new TypeDef(TypeEnum.array, FormEnum.array, TypeofEnum.object, (v) =>
    Array.isArray(v)
  ),
  new TypeDef(
    TypeEnum.map,
    FormEnum.map,
    TypeofEnum.object,
    (m) => m instanceof Map
  ),
  new TypeDef(
    TypeEnum.set,
    FormEnum.set,
    TypeofEnum.object,
    (s) => s instanceof Set
  ),
  new TypeDef(
    TypeEnum.object,
    FormEnum.object,
    TypeofEnum.object,
    (o) => o && typeof o === 'object'
  ),
];

export function typeToForm(type: TypeEnumType): FormEnumType {
  const d = types.find((d) => d.type === type);
  return d?.form || FormEnum.void;
}

export const describe = (
  value: any,
  reflect: string | boolean = false
): TypeDef | TypeEnumType | FormEnumType => {
  if (reflect) {
    const t: TypeDef = describe(value) as TypeDef;
    if (typeof t === 'object') {
      if (reflect === true) {
        return t.type;
      }
      if (
        reflect === 'type' ||
        reflect === 'form' ||
        reflect === 'typeOf' ||
        reflect === 'family'
      ) {
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
  console.error('describe failure to analyze', value);
  throw new Error('cannot analyze value');
};

export const describeNumber = (value: any): NumberEnumType => {
  if ([ 'number', 'bigint' ].includes(typeof value)) {
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
