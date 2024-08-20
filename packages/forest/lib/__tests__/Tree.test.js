"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const Forest_1 = __importDefault(require("../Forest"));
const engineBasic_1 = require("../engines/engineBasic");
const fibInitializer = {
    name: constants_1.ACTION_NAME_INITIALIZER,
    mutator(branch, data) {
        const [init] = data;
        if (init === undefined)
            return 0;
        return init;
    },
};
const fibNext = {
    name: "next",
    mutator(branch) {
        const p1 = branch.prev;
        if (!p1)
            return 0;
        const p2 = p1.prev;
        if (!p2) {
            if (p1.value === 0)
                return 1;
            return p1.value;
        }
        return p1.value + p2.value;
    },
};
const fibEngine = {
    name: "fib",
    actions: new Map([
        [constants_1.ACTION_NAME_INITIALIZER, fibInitializer],
        ["next", fibNext],
    ]),
};
describe("Tree", () => {
    describe("basic series", () => {
        it("should allow the value to be replaced", () => {
            const f = new Forest_1.default([engineBasic_1.dataEngineBasic]);
            const tree = f.tree("basic-tree", {
                engineName: "basic",
                val: 100,
            });
            expect(tree.value).toBe(100);
            tree.mutate("set", 200);
            expect(tree.value).toBe(200);
        });
    });
    describe("fibonacci series", () => {
        describe("initial value", () => {
            it("should have the intial value determined by its initializer", () => {
                const f = new Forest_1.default([fibEngine]);
                const t = f.tree("fromZero", { engineName: "fib" });
                expect(t.value).toBe(0);
            });
            it("should allow a value to be seeded", () => {
                const f = new Forest_1.default([fibEngine]);
                const t = f.tree("from100", { engineName: "fib", val: 100 });
                expect(t.value).toBe(100);
            });
        });
        describe("next values", () => {
            it("should increase by the fibonacci scale", () => {
                const f = new Forest_1.default([fibEngine]);
                const t = f.tree("fromZero", { engineName: "fib" });
                t.mutate("next");
                expect(t.value).toBe(1);
                t.mutate("next");
                expect(t.value).toBe(1);
                t.mutate("next");
                expect(t.value).toBe(2);
                t.mutate("next");
                expect(t.value).toBe(3);
                t.mutate("next");
                expect(t.value).toBe(5);
                t.mutate("next");
                expect(t.value).toBe(8);
                t.mutate("next");
                expect(t.value).toBe(13);
            });
            it("should increase based on the seed", () => {
                const f = new Forest_1.default([fibEngine]);
                const t = f.tree("from100", { engineName: "fib", val: 100 });
                t.mutate("next");
                expect(t.value).toBe(100);
                t.mutate("next");
                expect(t.value).toBe(200);
                t.mutate("next");
                expect(t.value).toBe(300);
                t.mutate("next");
                expect(t.value).toBe(500);
                t.mutate("next");
                expect(t.value).toBe(800);
                t.mutate("next");
                expect(t.value).toBe(1300);
            });
            it("should increase based on a negative seed", () => {
                const f = new Forest_1.default([fibEngine]);
                const t = f.tree("fromNeg1", { engineName: "fib", val: -1 });
                expect(t.value).toBe(-1);
                t.mutate("next");
                expect(t.value).toBe(-1);
                t.mutate("next");
                expect(t.value).toBe(-2);
                t.mutate("next");
                expect(t.value).toBe(-3);
                t.mutate("next");
                expect(t.value).toBe(-5);
                t.mutate("next");
                expect(t.value).toBe(-8);
                t.mutate("next");
                expect(t.value).toBe(-13);
            });
        });
    });
});
