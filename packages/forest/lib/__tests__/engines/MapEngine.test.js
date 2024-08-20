"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Forest_1 = __importDefault(require("../../Forest"));
require("@types/jest");
const engineMap_1 = require("../../engines/engineMap");
const FOO_BAR = new Map([
    ["foo", "vey"],
    ["bar", 200],
]);
const NEW_DATA = new Map([
    ["foo", "vey"],
    ["bar", 300],
]);
describe("DistMap", () => {
    describe("set", () => {
        it("should allow you to set individual values", () => {
            const f = new Forest_1.default([engineMap_1.engineMap]);
            const pips = f.tree("pips", {
                engineName: "map",
                val: new Map(),
            });
            expect(pips.value.has("foo")).toBeFalsy();
            pips.mut.set("foo", "bar");
            expect(pips.value.has("foo")).toBeTruthy();
            expect(pips.value.get("foo")).toEqual("bar");
        });
        it("should allow you to set reset values", () => {
            const f = new Forest_1.default([engineMap_1.engineMap]);
            const pips = f.tree("pips", {
                engineName: "map",
                val: new Map([["foo", "vey"]]),
            });
            expect(pips.value.has("foo")).toBeTruthy();
            pips.mut.set("foo", "bar");
            expect(pips.value.has("foo")).toBeTruthy();
            expect(pips.value.get("foo")).toEqual("bar");
            pips.mut.set("foo", "Hippo");
            expect(pips.value.get("foo")).toEqual("Hippo");
        });
    });
    describe("delete", () => {
        const f = new Forest_1.default([engineMap_1.engineMap]);
        const pips = f.tree("pips", {
            engineName: "map",
            // @ts-ignore
            val: new Map([
                ["foo", "vey"],
                ["bar", 200],
            ]),
        });
        expect(pips.value.size).toBe(2);
        pips.mut.delete({ delKey: "bar" });
        expect(pips.value.size).toBe(1);
        expect(pips.value.has("bar")).toBeFalsy();
        pips.mut.set("bar", 300);
        expect(pips.value.size).toBe(2);
        expect(pips.value.has("bar")).toBeTruthy();
        expect(pips.value.get("bar")).toEqual(300);
    });
    describe("patch", () => {
        it("should allow a patch", () => {
            const f = new Forest_1.default([engineMap_1.engineMap]);
            const pips = f.tree("pips", {
                engineName: "map",
                // @ts-ignore
                val: new Map(FOO_BAR),
            });
            pips.mut.patch([
                ["bar", 300],
                ["vey", "foo"],
            ]);
            expect(pips.value).toEqual(new Map([
                ["foo", "vey"],
                ["bar", 300],
                ["vey", "foo"],
            ]));
            pips.mut.set("vey", 400);
            expect(pips.value).toEqual(new Map([
                ["foo", "vey"],
                ["bar", 300],
                ["vey", 400],
            ]));
        });
    });
    describe("replace", () => {
        it("should allow a replace", () => {
            const f = new Forest_1.default([engineMap_1.engineMap]);
            const pips = f.tree("pips", {
                engineName: "map",
                // @ts-ignore
                val: new Map(FOO_BAR),
            });
            pips.mut.replace(NEW_DATA);
            expect(pips.value).toEqual(NEW_DATA);
            pips.mut.set("vey", 400);
            //@ts-ignore
            expect(pips.value).toEqual(new Map([
                ["foo", "vey"],
                ["bar", 300],
                ["vey", 400],
            ]));
        });
    });
});
