import { NumberEnumType } from "./enums";
import type { TypeEnumType, FormEnumType } from "./enums";
type testFn = (value: any) => boolean;
export declare class TypeDef {
    readonly type: TypeEnumType;
    readonly form: FormEnumType;
    readonly typeOf: TypeEnumType;
    private test?;
    constructor(type: TypeEnumType, form: FormEnumType, typeOf: TypeEnumType, test?: testFn | undefined);
    /**
     * A very flat subspecies of FormEnum -- includes either 'void', 'scalar', 'function', or 'container'
     */
    get family(): string;
    includes(value: any, typeOf?: TypeEnumType | string): boolean;
}
export declare const types: TypeDef[];
export declare function typeToForm(type: TypeEnumType): FormEnumType;
export declare const describe: (value: any, reflect?: string | boolean) => TypeDef | TypeEnumType | FormEnumType;
export declare const describeNumber: (value: any) => NumberEnumType;
export {};
