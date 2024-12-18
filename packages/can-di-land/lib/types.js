"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.isPromise =
    exports.isPromiseQueueMessage =
    exports.isResEventValues =
    exports.isEventValue =
    exports.isEventResource =
    exports.isEventError =
    exports.isEventInit =
    exports.isResConfig =
    exports.isResourceType =
      void 0);
const resourceTypes = ["value", "func", "comp"];
function isResourceType(e) {
  return resourceTypes.includes(e);
}
function isResConfig(s) {
  return !(
    !s ||
    "object" != typeof s ||
    (!s && isResourceType(s.type)) ||
    ["final", "async"].some((e) => e in s && "boolean" != typeof s[e])
  );
}
function isEventInit(e) {
  return !!(
    e &&
    "object" == typeof e &&
    "type" in e &&
    "init" === e.type &&
    "value" in e &&
    "target" in e
  );
}
function isEventError(e) {
  return !!(
    e &&
    "object" == typeof e &&
    "type" in e &&
    "async-error" === e.type &&
    "value" in e &&
    "target" in e
  );
}
function isEventResource(e) {
  return !!(
    e &&
    "object" == typeof e &&
    "type" in e &&
    "resource" === e.type &&
    "value" in e &&
    "target" in e
  );
}
function isEventValue(e) {
  return !!(
    e &&
    "object" == typeof e &&
    "type" in e &&
    "value" === e.type &&
    "value" in e &&
    "target" in e
  );
}
function isResEventValues(e) {
  return !!(
    e &&
    "object" == typeof e &&
    "type" in e &&
    "values" === e.type &&
    "value" in e
  );
}
function isPromiseQueueMessage(e) {
  return !!(e && "object" == typeof e && "key" in e && "value" in e);
}
function isPromise(e) {
  return !!(
    e &&
    "object" == typeof e &&
    "then" in e &&
    "function" == typeof e.then
  );
}
(exports.isResourceType = isResourceType),
  (exports.isResConfig = isResConfig),
  (exports.isEventInit = isEventInit),
  (exports.isEventError = isEventError),
  (exports.isEventResource = isEventResource),
  (exports.isEventValue = isEventValue),
  (exports.isResEventValues = isResEventValues),
  (exports.isPromiseQueueMessage = isPromiseQueueMessage),
  (exports.isPromise = isPromise);
