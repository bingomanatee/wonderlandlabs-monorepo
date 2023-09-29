import { CollectionDef, LeafRecord, QueryDef, RecordFieldSchema, Tree } from './types'
import { TypeEnumType } from '@wonderlandlabs/walrus/dist/enums'
import { ErrorPlus } from './ErrorPlus'
import { type } from '@wonderlandlabs/walrus'
import { BehaviorSubject, distinctUntilChanged, map, takeWhile } from 'rxjs'
import { isEqual } from 'lodash'
import { SINGLE } from './constants'

function compareMaps(map1: Map<any, any>, map2: Map<any, any>, query: QueryDef) {

  if (query.identity) {
    const firstValue = map1.get(query.identity);
    const secondValue = map2.get(query.identity)
    return isEqual(firstValue, secondValue )
  }

  if (map1.size !== map2.size) {
    return false;
  }
  return Array.from(map1.keys()).every((key) => {
    let v1 = map1.get(key);
    let v2 = map2.get(key);

    if (v1 === v2) {
      return true;
    }
    return isEqual(v1, v2);
  });

}

export default class CollectionClass {
  values: Map<any, any> = new Map()

  constructor(public tree: Tree, public config: CollectionDef, values?: any[]) {
    this._validateConfig();

    this.subject = new BehaviorSubject(this.values);
    values?.forEach((value) => {
      this.setValue(value);
    })
  }

  private _fieldMap?: Map<string, RecordFieldSchema>
  get fieldMap() {
    if (!this._fieldMap) {
      this._fieldMap = this.config.fields.reduce((m, field) => {
        m.set(field.name, field);
        return m;
      }, new Map())
    }
    return this._fieldMap;
  }

  private _validateConfig() {
    if (!this.config.identity) throw new ErrorPlus('colletion config missing identity', this.config);

    switch (typeof this.config.identity) {
      case 'string':
        const idDef = this.fieldMap.get(this.config.identity);
        if (!idDef) {
          throw new ErrorPlus(
            `collection config identity must include identity field ${this.config.identity}`,
            this.config)
        }
        if (idDef.optional) {
          throw new ErrorPlus('collection identity field cannot be empty', this.config)
        }
        break;
      case 'function':
        break;
      default:
        throw new ErrorPlus('identity must be a string or function', {config: this.config})
    }
  }

  get name() {
    return this.config.name
  }

  public subject: BehaviorSubject<any>

  public validate(value: LeafRecord) {
    for (let def of this.config.fields) {
      if (def.name in value) {
        const fieldValue = value[def.name]
        const fvType = type.describe(fieldValue, true) as TypeEnumType;
        if (def.type) {
          if (Array.isArray(def.type)) {
            if (!(def.type as TypeEnumType[]).includes(fvType)) {
              throw new ErrorPlus(`field ${def.name} does not match any allowed type`,
                { def, value, collection: this.name })
            }
          } else {
            if (fvType !== def.type) {
              throw new ErrorPlus('field does not match allowed type',
                {
                  type: def.type,
                  field: def.name,
                  value, collection: this.name
                })
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
              })
          }
        }
      } else {
        if (!def.optional) {
          throw new ErrorPlus(
            `validation error: ${this.name} record missing required field ${def.name}`,
            { data: value, collection: this, field: def.name }
          )
        }
      }
    }
  }

  public identityOf(value: LeafRecord) {
    if (this.config.identity === SINGLE) {
      return SINGLE;
    }
    if (typeof this.config.identity === 'string') {
      return value[this.config.identity];
    }
    if (typeof this.config.identity === 'function') {
      return this.config.identity(value, this);
    }
  }

  /**
   * this is an "inner put" that (will be) triggering transactional backups
   */
  public setValue(value: LeafRecord) {
    this.validate(value);
    const next = new Map(this.values);
    const id = this.identityOf(value);
    next.set(id, value);
    this.values = next;
    this.subject.next(next);
    return id;
  }

  put(value: LeafRecord) {
    return this.tree.do(() => {
      return this.setValue(value);
    });
  }

  get(id: any) {
    if (!this.values.has(id)) {
      console.warn(`attempt to get a value for ${id} that is not in ${this.name}`, this, id);
    }
    return this.values.get(id);
  }

  query(query: Partial<QueryDef>) {
    if (query.collection && (query.collection !== this.name)) {
      throw  new ErrorPlus(`cannot query ${this.name}with query for ${query.collection}`, query)
    }

    const cQuery = {collection: this.name, ...query}
    if (cQuery.identity) {
      return this.subject
        .pipe(
          takeWhile((values) => values.has(query.identity!)),
          distinctUntilChanged((map1, map2) => compareMaps(map1, map2, cQuery)),
          map(() => ([this.tree.leaf(this.name, query.identity!)])
          ),
        )
    }

    return this.subject.pipe(
      distinctUntilChanged((map1, map2) => compareMaps(map1, map2, cQuery)),
      map((values) => (
          Array.from(values.keys())
            .map(
              (id) => {
                return this.tree.leaf(this.name, id);
              }
            )
        )
      )
    )
  }

  fetch(query: QueryDef) {
    let out;
    let sub = this.query(query)
      .subscribe((value) => {
        out = value;
        sub.unsubscribe();
      });

    sub?.unsubscribe()

    return out;
  }
}
