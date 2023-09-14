import { upperFirst } from 'lodash'
import { TypeEnum } from '@wonderlandlabs/walrus/dist/enums'
import { c } from '@wonderlandlabs/collect'
import { isSchemaRecord, isSchemaTupleList, SchemaProps, SchemaTupleList } from './types'

export class Schema implements SchemaProps {
  constructor(public options: SchemaProps, public parent?: Schema) {

  }

  get name() {
    return this.options.name;
  }

  public get typeName(): string {
    return this.options.typescriptName || upperFirst(this.name)
  }

  public get fieldTypescript(): string {
    return `${this.name}: ${this.typeName}`
  }

  get fields(): SchemaTupleList {
    if (!this.options.fields) {
      return [];
    }

    if (isSchemaRecord(this.options.fields)) {
      return c(this.options.fields).getReduce((memo, schema, name) => {
        memo.push({ name, schema });
        return memo;
      }, []);
    }

    if (isSchemaTupleList(this.options.fields)) {
      return this.options.fields;
    }

    return [];
  }

  public get typescriptField() {
    return `${this.name}: ${this.typeName}.$value`
  }

  public get typescript(): string {
    return `
      export namespace ${this.typeName} {
        ${
      this.fields.map(
        subSchema => subSchema.typescript)
        .join("\n")
    }
        export type $value = ${this.typescriptDef}
      }
      `;
  }

  public get typescriptDef() {
    switch (this.options.$type) {
      case TypeEnum.object:
        if (this.fields) {
          if (Array.isArray(this.fields)) {
            if (this.fields?.length) {
              return `{
                ${this.fields.map(schema => schema.typescriptField).join(",\n")}
              }
              `
            }
          }
        }
        return `Record<string, any>`
        break;
    }
    return `${this.options.$type}`
  }
}
