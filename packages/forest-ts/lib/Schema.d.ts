import { SchemaProps, SchemaPropsInput } from './types';
export declare function isSchemaProps(arg: any): arg is SchemaProps;
export declare function isSchema(arg: any): arg is Schema;
export declare class Schema {
    optionsInput: SchemaPropsInput;
    parent?: Schema | undefined;
    constructor(optionsInput: SchemaPropsInput, parent?: Schema | undefined);
    options: SchemaProps;
    get name(): string;
    get typeName(): string;
    get fieldTypescript(): string;
    get fields(): Schema[];
    get typescriptField(): string;
    get typescript(): string;
    get typescriptDef(): string;
}
