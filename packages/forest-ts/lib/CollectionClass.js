"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const ErrorPlus_1 = require("./ErrorPlus"),
  walrus_1 = require("@wonderlandlabs/walrus"),
  rxjs_1 = require("rxjs"),
  utils_1 = require("./utils");
function asTypeEnum(t) {
  return "string" == typeof t && t in walrus_1.TypeEnum
    ? walrus_1.TypeEnum[t]
    : t;
}
const NAME_TEST = /^[a-z\-_$0-9]+$/;
class CollectionClass {
  constructor(t, e, i) {
    (this.tree = t),
      (this.config = e),
      (this.dataValidators = new Set()),
      this._validateConfig(),
      e.schema &&
        (t = this.tree.createSchemaValidator(e.schema, this)) &&
        (this._schemaValidator = t),
      e.test && this.addValidator(e.test);
    const s = new Map();
    null != i &&
      i.forEach((t) => {
        this.validate(t);
        var e = this.identityOf(t);
        s.set(e, t);
      }),
      (this.subject = new rxjs_1.BehaviorSubject(s)),
      this.subject.subscribe(() => {
        this.tree.updates.next({
          action: "update-collection",
          collection: this.name,
        });
      });
  }
  unPut(t) {
    t.create
      ? this.revertedValues.delete(t.identity)
      : this.revertedValues.set(t.identity, t.prev);
  }
  get revertedValues() {
    return (
      this._revertedValues || (this._revertedValues = new Map(this.values)),
      this._revertedValues
    );
  }
  finishRevert() {
    this._revertedValues &&
      (this.subject.next(this._revertedValues), delete this._revertedValues);
  }
  _validateConfig() {
    if (!this.config.identity)
      throw new ErrorPlus_1.ErrorPlus(
        "collection config missing identity",
        this.config,
      );
    if (
      !this.config.name ||
      "string" != typeof this.config.name ||
      !NAME_TEST.test(this.config.name)
    )
      throw new ErrorPlus_1.ErrorPlus(
        "collections must have non-empty name (string, snake_case)",
      );
  }
  get name() {
    return this.config.name;
  }
  get values() {
    return this.subject.value;
  }
  schemaValidator(t) {
    this._schemaValidator && this._schemaValidator(t, this);
  }
  validate(e) {
    this.schemaValidator(e),
      this.dataValidators.forEach((t) => {
        t(e, this);
      });
  }
  addValidator(t) {
    this.dataValidators.add(t);
  }
  removeValidator(t) {
    this.dataValidators.delete(t);
  }
  identityOf(t) {
    if ("string" == typeof this.config.identity) return t[this.config.identity];
    if ("function" == typeof this.config.identity)
      return this.config.identity(t, this);
    throw new ErrorPlus_1.ErrorPlus("config identity is not valid", {
      config: this.config,
      collection: this,
    });
  }
  setValue(t) {
    this.validate(t);
    var e = new Map(this.values),
      i = this.identityOf(t);
    return (
      this.tree.updates.next({
        action: "put-data",
        collection: this.name,
        identity: i,
        value: t,
      }),
      e.set(i, t),
      this.subject.next(e),
      i
    );
  }
  put(t) {
    return this.tree.do(() => this.setValue(t));
  }
  get(t) {
    return this.values.get(t);
  }
  query(e) {
    if (e.collection && e.collection !== this.name)
      throw new ErrorPlus_1.ErrorPlus(
        `cannot query ${this.name}with query for ` + e.collection,
        e,
      );
    const t = this,
      i = Object.assign({ collection: this.name }, e);
    return i.identity
      ? this.subject.pipe(
          (0, rxjs_1.takeWhile)((t) => t.has(e.identity)),
          (0, rxjs_1.distinctUntilChanged)((t, e) =>
            (0, utils_1.compareMaps)(t, e, i),
          ),
          (0, rxjs_1.map)(() => t._fetch(i)),
        )
      : this.subject.pipe(
          (0, rxjs_1.distinctUntilChanged)((t, e) =>
            (0, utils_1.compareMaps)(t, e, i),
          ),
          (0, rxjs_1.map)(() => this._fetch(i)),
        );
  }
  _fetch(t) {
    const e = Object.assign({ collection: this.name }, t);
    return t.identity
      ? this.has(t.identity)
        ? [this.tree.leaf(this.name, t.identity, e)]
        : []
      : Array.from(this.values.keys()).map((t) =>
          this.tree.leaf(this.name, t, e),
        );
  }
  has(t) {
    return this.values.has(t);
  }
  fetch(t) {
    if (t.collection && t.collection !== this.name)
      throw new ErrorPlus_1.ErrorPlus(
        `cannot query ${this.name}with query for ` + t.collection,
        t,
      );
    return this._fetch(t);
  }
}
exports.default = CollectionClass;
