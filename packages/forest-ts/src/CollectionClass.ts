import {
  CollectionDef,
  Data,
  DataID,
  DataValidatorFn,
  QueryDef,
  RecordMap,
  RecordFieldSchema,
  TreeIF,
  UpdatePutMsg
} from './types';
import { TypeEnumType } from '@wonderlandlabs/walrus/dist/enums';
import { ErrorPlus } from './ErrorPlus';
import { TypeEnum } from '@wonderlandlabs/walrus';
import { BehaviorSubject, distinctUntilChanged, map, takeWhile } from 'rxjs';

import { c } from '@wonderlandlabs/collect';
import { compareMaps, validateField } from './utils';
import { CollectionIF } from './types';

function asTypeEnum(value: string | TypeEnumType): TypeEnumType {
  if (typeof value === 'string' && value in TypeEnum) {
    // @ts-expect-error extracting from TypeEnum falsely is TS error
    return TypeEnum[value];
  }
  return value;
}

const NAME_TEST = /^[a-z\-_$0-9]+$/;

//console.log('name test of good name "f00-bar"', NAME_TEST.test('f00-bar'));
// console.log('name test of bad name "spacey lacey"', NAME_TEST.test('spacey lacy'));
/**
 * This is a bundle of records with the same fields.
 * There is a special case where the collection has a single record whose ID is `SINGLE` (a constant symbol)
 * in which only one record exists in the collection.
 */
export default class CollectionClass implements CollectionIF {
  constructor(public tree: TreeIF, public config: CollectionDef, records?: Data[]) {
    this._validateConfig();

    if (config.schema) {
      const schemaValidator = this.tree.createSchemaValidator(config.schema, this);
      if (schemaValidator) {
        this._schemaValidator = schemaValidator;
      }
    }
    if (config.test) {
      this.addValidator(config.test);
    }

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

  unPut(p: UpdatePutMsg): void {
    if (p.create) {
      this.revertedValues.delete(p.identity);
    } else {
      this.revertedValues.set(p.identity, p.prev!);
    }
  }

  private _revertedValues?: RecordMap;
  private get revertedValues() {
    if (!this._revertedValues) {
      this._revertedValues = new Map(this.values);
    }
    return this._revertedValues;
  }

  public finishRevert() {
    if (this._revertedValues) {
      this.subject.next(this._revertedValues);
      delete this._revertedValues;
    }
  }

  private _validateConfig() {
    const identity = this.config.identity;
    if (!identity) {
      throw new ErrorPlus('collection config missing identity', this.config);
    }

    if (!(this.config.name && typeof this.config.name === 'string' && NAME_TEST.test(this.config.name))) {
      throw new ErrorPlus('collections must have non-empty name (string, snake_case)');
    }
  }

  get name() {
    return this.config.name;
  }

  get values(): RecordMap {
    return this.subject.value;
  }

  public subject: BehaviorSubject<any>;

  private _schemaValidator?: DataValidatorFn;

  private schemaValidator(value: Data) {
    if (this._schemaValidator) {
      this._schemaValidator(value, this);
    }
  }

  /**
   * field and dataValidators throw when they detect an error.
   * @param value
   */
  public validate(value: Data) {
    this.schemaValidator(value);
    this.dataValidators.forEach((div) => {
      div(value, this);
    });
  }

  private dataValidators: Set<DataValidatorFn> = new Set();

  public addValidator(div: DataValidatorFn) {
    this.dataValidators.add(div);
  }

  public removeValidator(div: DataValidatorFn) {
    this.dataValidators.delete(div);
  }

  public identityOf(value: Data): DataID {
    if (typeof this.config.identity === 'string') {
      return value[this.config.identity] as DataID;
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
    this.tree.updates.next({
      action: 'put-data',
      collection: this.name,
      identity: id,
      value
    });

    next.set(id, value);
    this.subject.next(next);
    return id;
  }

  put(value: Data): DataID {
    return this.tree.do(() => {
      return this.setValue(value);
    }) as DataID;
  }

  get(id: DataID) {
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

  has(identity: DataID) {
    return this.values.has(identity);
  }

  fetch(query: Partial<QueryDef>) {
    if (query.collection && (query.collection !== this.name)) {
      throw new ErrorPlus(`cannot query ${this.name}with query for ${query.collection}`, query);
    }
    return this._fetch(query);
  }

}
