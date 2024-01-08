import { CollectionDef, Data, QueryDef, RecordFieldSchema, TreeIF } from './types';
import { TypeEnumType } from '@wonderlandlabs/walrus/dist/enums';
import { ErrorPlus } from './ErrorPlus';
import { type, TypeEnum } from '@wonderlandlabs/walrus';
import { BehaviorSubject, distinctUntilChanged, map, takeWhile } from 'rxjs';

import { c } from '@wonderlandlabs/collect';
import { compareMaps } from './utils';

function asTypeEnum(value:  string | TypeEnumType): TypeEnumType {
  if (typeof value === 'string' && value in TypeEnum) {
    // @ts-ignore
    return TypeEnum[value];
  }
  return value;
}

type RecordMap = Map<any, any>;
const NAME_TEST = /^[a-z\-_$0-9]+$/;

//console.log('name test of good name "f00-bar"', NAME_TEST.test('f00-bar'));
// console.log('name test of bad name "spacey lacey"', NAME_TEST.test('spacey lacy'));
/**
 * This is a bundle of records with the same fields.
 * There is a special case where the collection has a single record whose ID is `isSingle` (a constant symbol)
 * in which only one record exists in the collection.
 */
export default class CollectionClass {
  constructor(public tree: TreeIF, public config: CollectionDef, records?: Data[]) {
    this._validateConfig();

    const map = new Map();
    records?.forEach((value) => {
      this.validate(value);
      const id = this.identityOf(value);
      map.set(id, value);
    });

    this.subject = new BehaviorSubject<RecordMap>(map);

    this.subject.subscribe(() => {
      this.tree.updates.next({
        action: 'update-collection',
        collection: this.name,
      });
    });
  }

  get values() : RecordMap {
    return this.subject.value;
  }

  private _fieldMap?: Map<string, RecordFieldSchema>;
  get fieldMap() {
    if (!this._fieldMap) {
      if (Array.isArray(this.config.fields)) {
        this._fieldMap = this.config.fields.reduce((m, field) => {
          const schema = { ...field };
          if (typeof field.type === 'string') {
            schema.type = asTypeEnum(field.type);
          } else if (Array.isArray(field.type)) {
            schema.type = field.type.map(asTypeEnum);
          }
          m.set(field.name, schema);
          return m;
        }, new Map());
      } else {
        this._fieldMap = new Map();
        c(this.config.fields).forEach((field, name) => {
          if (typeof field !== 'object') {
            field = { type: field };
          }
          this._fieldMap!.set(name, { ...field, name });
        });
      }
    }
    return this._fieldMap;
  }

  private _validateConfig() {
    const identity = this.config.identity;
    if (!identity) {
      throw new ErrorPlus('collection config missing identity', this.config);
    }
    if (typeof identity === 'string') {
      const idDef = this.fieldMap.get(identity);
      if (!idDef) {
        throw new ErrorPlus(
          `collection config identity must include identity field ${identity}`,
          this.config);
      }
      if (idDef.optional) {
        throw new ErrorPlus('collection identity field cannot be optional', this.config);
      }
    } else if (typeof identity === 'function') {
      // is assumed to be valid
    } else {
      throw new ErrorPlus('identity must be a string or function', { config: this.config });
    }

    if (!(this.config.name && typeof this.config.name === 'string' && NAME_TEST.test(this.config.name))) {
      throw new ErrorPlus('collections must have non-empty name (string, snake_case)');
    }
  }

  get name() {
    return this.config.name;
  }

  public subject: BehaviorSubject<any>;

  public validate(value: Data) {
    this.fieldMap.forEach((def) => {
      if (def.name in value) {
        const fieldValue = value[def.name];
        const fvType = type.describe(fieldValue, true) as TypeEnumType;
        if (def.type) {
          if (Array.isArray(def.type)) {
            if (!(def.type as TypeEnumType[]).includes(fvType)) {
              throw new ErrorPlus(`field ${def.name} does not match any allowed type`,
                { def, value, collection: this.name });
            }
          } else {
            if (fvType !== def.type) {
              const info = {
                type: def.type,
                field: def.name,
                value, collection: this.name
              };

              throw new ErrorPlus('field does not match allowed type',
                info);
            }
          }
        }
        if (def.validator) {
          const error = def.validator(fieldValue, this);
          if (error) {
            throw new ErrorPlus(`failed validation filter for ${def.name}`,
              {
                field:
                def.name,
                value,
                collection: this.name
              });
          }
        }
      } else {
        if (!def.optional) {
          throw new ErrorPlus(
            `validation error: ${this.name} record missing required field ${def.name}`,
            { data: value, collection: this, field: def.name }
          );
        }
      }
    });
  }

  public identityOf(value: Data) {
    if (typeof this.config.identity === 'string') {
      return value[this.config.identity];
    }
    if (typeof this.config.identity === 'function') {
      return this.config.identity(value, this);
    }
    throw new ErrorPlus('config identity is not valid', { config: this.config, collection: this });
  }

  /**
   * this is an "inner put" that (will be) triggering transactional backups
   */
  public setValue(value: Data) {
    this.validate(value);
    const next = new Map(this.values);
    const id = this.identityOf(value);

    const info = {
      action: 'put-data',
      collection: this.name,
      identity: id,
      value
    };
    console.log('setValue: messaging update', info);
    this.tree.updates.next(info);

    next.set(id, value);
    this.subject.next(next);
    return id;
  }

  put(value: Data) {
    return this.tree.do(() => {
      return this.setValue(value);
    });
  }

  get(id: any) {
    return this.values.get(id);
  }

  query(query: Partial<QueryDef>) {
    if (query.collection && (query.collection !== this.name)) {
      throw new ErrorPlus(`cannot query ${this.name}with query for ${query.collection}`, query);
    }

    const self = this;
    const cQuery = { collection: this.name, ...query };
    if (cQuery.identity) {
      return this.subject
        .pipe(
          takeWhile((values) => values.has(query.identity!)),
          distinctUntilChanged((map1, map2) => compareMaps(map1, map2, cQuery)),
          map(() => self._fetch(cQuery)
          ),
        );
    }

    return this.subject.pipe(
      distinctUntilChanged((map1, map2) => compareMaps(map1, map2, cQuery)),
      map(() => this._fetch(cQuery))
    );
  }

  private _fetch(query: Partial<QueryDef>) {
    const localQuery = { collection: this.name, ...query };
    if (query.identity) {
      if (!this.has(query.identity)) {
        return [];
      }
      return [ this.tree.leaf(this.name, query.identity, localQuery) ];
    }
    return Array.from(this.values.keys()).map((key) => this.tree.leaf(this.name, key, localQuery));
  }

  has(identity: any) {
    return this.values.has(identity);
  }

  fetch(query: Partial<QueryDef>) {
    if (query.collection && (query.collection !== this.name)) {
      throw new ErrorPlus(`cannot query ${this.name}with query for ${query.collection}`, query);
    }
    return this._fetch(query);
  }

}
