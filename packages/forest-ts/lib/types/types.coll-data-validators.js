"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFieldDefObj =
  exports.isRecordFieldSchema =
  exports.isBaseRecordFieldSchema =
  exports.isDataValidatorFn =
  exports.isData =
    void 0;
const walrus_1 = require("@wonderlandlabs/walrus");
function isObj(def) {
  return walrus_1.type.describe(def, true) === walrus_1.TypeEnum.object;
}
function isData(def) {
  if (!isObj(def)) {
    return false;
  }
  return true;
}
exports.isData = isData;
function isDataValidatorFn(def) {
  return typeof def === "function";
}
exports.isDataValidatorFn = isDataValidatorFn;
function isTypeEnumDef(def) {
  return typeof def === "string" && def in walrus_1.TypeEnum;
}
/**
 * Although there is a wide variety of fields in a potential schema field def,
 * to be meaningful it must either have a single field type or a validator function.
 */
function isBaseRecordFieldSchema(def) {
  if (!isObj(def)) {
    return false;
  }
  if (!("type" in def || "validator" in def)) {
    return false;
  }
  if ("type" in def) {
    if (!isTypeEnumDef(def.type)) {
      console.log("---- bad isTypeEnumDef type:", def.type);
      return false;
    }
  }
  if ("validator" in def) {
    if (!isDataValidatorFn(def.validator)) {
      return false;
    }
  }
  return true;
}
exports.isBaseRecordFieldSchema = isBaseRecordFieldSchema;
function isRecordFieldSchema(def) {
  if (!isObj(def)) {
    return false;
  }
  if (!(def.name && typeof def.name === "string")) {
    return false;
  }
  return isBaseRecordFieldSchema(def);
}
exports.isRecordFieldSchema = isRecordFieldSchema;
function isFieldDef(def) {
  if (!def) {
    return false;
  }
  if (typeof def === "string") {
    return isTypeEnumDef(def);
  }
  if (isBaseRecordFieldSchema(def)) {
    return true;
  }
  return false;
}
function isFieldDefObj(def) {
  if (!(walrus_1.type.describe(def, true) === walrus_1.TypeEnum.object)) {
    return false;
  }
  const defObj = def;
  for (const key of Object.keys(defObj)) {
    const fDef = defObj[key];
    if (!isFieldDef(fDef)) {
      return false;
    }
  }
  return true;
}
exports.isFieldDefObj = isFieldDefObj;
