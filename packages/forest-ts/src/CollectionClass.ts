import { CollectionDef, LeafRecord, QueryDef, RecordFieldSchema, Tree } from './types';
import { TypeEnumType } from '@wonderlandlabs/walrus/dist/enums';
import { ErrorPlus } from './ErrorPlus';
import { type } from '@wonderlandlabs/walrus';
import { BehaviorSubject, distinctUntilChanged, map, takeWhile } from 'rxjs';

import { c } from '@wonderlandlabs/collect';
import { compareMaps } from './utils';

export default class CollectionClass {
  constructor(public tree: Tree, public config: CollectionDef, records?: LeafRecord[]) {
    this._validateConfig();

    const map = new Map();
    records?.forEach((value) => {
      this.validate(value);
      const id = this.identityOf(value);
      map.set(id, value);
    });

    this.subject = new BehaviorSubject(map);

    this.subject.subscribe(() => {
      this.tree.updates.next({
        action: 'update-collection',
        collection: this.name,
      });
    });
  }

  get values() {
    return this.subject.value;
  }

  private _fieldMap?: Map<string, RecordFieldSchema>;
  get fieldMap() {
    if (!this._fieldMap) {
      if (Array.isArray(this.config.fields)) {
        this._fieldMap = this.config.fields.reduce((m, field) => {
          m.set(field.name, field);
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
    if (!this.config.identity) {
      throw new ErrorPlus('colletion config missing identity', this.config);
    }

    switch (typeof this.config.identity) {
    case 'string':
      const idDef = this.fieldMap.get(this.config.identity);
      if (!idDef) {
        throw new ErrorPlus(
          `collection config identity must include identity field ${this.config.identity}`,
          this.config);
      }
      if (idDef.optional) {
        throw new ErrorPlus('collection identity field cannot be empty', this.config);
      }
      break;
    case 'function':
      break;
    default:
      throw new ErrorPlus('identity must be a string or function', { config: this.config });
    }
  }

  get name() {
    return this.config.name;
  }

  public subject: BehaviorSubject<any>;

  public validate(value: LeafRecord) {
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
              throw new ErrorPlus('field does not match allowed type',
                {
                  type: def.type,
                  field: def.name,
                  value, collection: this.name
                });
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

  public identityOf(value: LeafRecord) {
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
  public setValue(value: LeafRecord) {
    this.validate(value);
    const next = new Map(this.values);
    const id = this.identityOf(value);
    next.set(id, value);
    this.subject.next(next);
    return id;
  }

  put(value: LeafRecord) {
    return this.tree.do(() => {
      return this.setValue(value);
    });
  }

  get(id: any) {
    return this.values.get(id);
  }

  query(query: Partial<QueryDef>) {
    if (query.collection && (query.collection !== this.name)) {
      throw  new ErrorPlus(`cannot query ${this.name}with query for ${query.collection}`, query);
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
      throw  new ErrorPlus(`cannot query ${this.name}with query for ${query.collection}`, query);
    }
    return this._fetch(query);
  }

}
