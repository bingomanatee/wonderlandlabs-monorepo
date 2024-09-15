"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Forest_1 = __importDefault(require("../../Forest"));
const engineBasic_1 = require("../../engines/engineBasic");
const engineMap_1 = require("../../engines/engineMap");
function makeBasic(f) {
    return f.tree("foo", {
        engineName: "basic",
        val: 0,
        validators: [
            function isNumeric(tree) {
                if (!(typeof tree.value === "number")) {
                    throw new Error("must be of type number");
                }
            },
        ],
    });
}
describe("validtion", () => {
    describe("validators", () => {
        it("should not block valid data", () => {
            const f = new Forest_1.default([engineBasic_1.dataEngineBasic]);
            const t = makeBasic(f);
            expect(t.value).toBe(0);
            t.mut.set(3);
            expect(t.value).toBe(3);
        });
        it("should block invalid data", () => {
            const f = new Forest_1.default([engineBasic_1.dataEngineBasic]);
            const t = makeBasic(f);
            expect(t.value).toBe(0);
            expect(() => t.mut.set("four")).toThrow("must be of type number");
            t.mut.set(3);
            expect(t.value).toBe(3);
        });
        it("should have error data in trim", () => {
            const f = new Forest_1.default([engineBasic_1.dataEngineBasic]);
            const t = makeBasic(f);
            expect(t.value).toBe(0);
            expect(() => t.mut.set("four")).toThrow("must be of type number");
            const [trimmed] = t.trimmed;
            expect(trimmed.data).toEqual(["four"]);
            const [err] = f.errors;
            expect(err.message).toBe("must be of type number");
        });
    });
    describe("mutation validators", () => {
        describe("specific mutator", () => {
            it("should allow proper values", () => {
                const f = new Forest_1.default([engineMap_1.engineMap]);
                const t = f.tree("foo", {
                    engineName: "map",
                    mutatorValidators: [
                        {
                            name: "set",
                            onlyFor: "set",
                            validator: ([key, val]) => {
                                if (typeof key !== "string") {
                                    throw new Error("key must be string");
                                }
                                if (typeof val !== "number") {
                                    throw new Error("val must be number");
                                }
                            },
                        },
                    ],
                });
                t.mut.set("alpha", 100);
                t.mut.set("beta", 200);
                expect(t.value.get("alpha")).toBe(100);
                expect(t.value.get("beta")).toBe(200);
            });
            it("should block bad values", () => {
                const f = new Forest_1.default([engineMap_1.engineMap]);
                const KEY_ERROR = "key must be string";
                const VAL_ERROR = "val must be number";
                const t = f.tree("foo", {
                    engineName: "map",
                    mutatorValidators: [
                        {
                            name: "set",
                            onlyFor: "set",
                            validator: ([key, val]) => {
                                if (typeof key !== "string") {
                                    throw new Error(KEY_ERROR);
                                }
                                if (typeof val !== "number") {
                                    throw new Error(VAL_ERROR);
                                }
                            },
                        },
                    ],
                });
                t.mut.set("alpha", 100);
                t.mut.set("beta", 200);
                expect(() => t.mut.set("alpha", "foo")).toThrow(VAL_ERROR);
                expect(() => t.mut.set(44, 300)).toThrow(KEY_ERROR);
                expect(t.value.get("alpha")).toBe(100);
                expect(t.value.get("beta")).toBe(200);
                expect(t.trimmed.length).toBe(0);
                const [e1, e2] = f.errors;
                expect(e1.message).toBe(VAL_ERROR);
                expect(e2.message).toBe(KEY_ERROR);
            });
        });
    });
});
