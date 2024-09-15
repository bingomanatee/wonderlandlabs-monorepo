"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Forest_1 = __importDefault(require("../Forest"));
const engineBasic_1 = require("../engines/engineBasic");
describe("Forest", () => {
    describe(".tree", () => {
        it("should throw if missing tree requested", () => {
            const f = new Forest_1.default([engineBasic_1.dataEngineBasic]);
            expect(() => f.tree("foo")).toThrow();
        });
        it("should define a tree if seeded", () => {
            const f = new Forest_1.default([engineBasic_1.dataEngineBasic]);
            const t = f.tree("foo", {
                engineName: "basic",
                val: "bar",
            });
            expect(t).toBeTruthy();
            expect(t.value).toBe("bar");
        });
    });
});
