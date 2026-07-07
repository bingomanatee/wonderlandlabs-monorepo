"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const engineForm_1 = require("../../engines/form/engineForm");
const Forest_1 = __importDefault(require("../../Forest"));
describe("engineForm", () => {
    describe("initialization", () => {
        it("has the right form props", () => {
            const f = new Forest_1.default([engineForm_1.engineForm]);
            const myForm = f.tree("myForm", {
                engineName: "form",
                val: {},
            });
            expect(myForm.engineName).toBe("form");
        });
    });
});
