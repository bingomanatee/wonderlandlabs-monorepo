"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore
const Forest_1 = require("../Forest");
const enums_1 = require("../helpers/enums");
function makeConfig() {
    return {
        maxWidth: 1024,
        apiUrl: "https://www.apis.com",
        backgroundColor: "#DDFFE1",
    };
}
describe("Forest.object", () => {
    // tests the existential ability for tree() to retrieve
    // and that it can retrieve (undefiend) without breaking
    describe(".tree()", () => {
        it("should return undefined for absent tree", () => {
            //@ts-ignore
            const f = new Forest_1.Forest();
            expect(f.tree("configs")).toBeFalsy();
        });
        it("should return a tree", () => {
            //@ts-ignore
            const f = new Forest_1.Forest();
            f.addTree({ name: "configs" });
            expect(f.tree("configs")).toBeTruthy();
        });
    });
    // tests that hasTree mirrors the result of the tree being present
    describe(".hasTree()", () => {
        it("should return undefined for absent tree", () => {
            //@ts-ignore
            const f = new Forest_1.Forest();
            expect(f.hasTree("configs")).toBe(false);
        });
        it("should return a tree", () => {
            //@ts-ignore
            const f = new Forest_1.Forest();
            f.addTree({ name: "configs" });
            expect(f.hasTree("configs")).toBe(true);
        });
    });
    describe("addTree", () => {
        it("should throw if it is asked to duplicate an existing tree", () => {
            const f = new Forest_1.Forest();
            f.addTree({
                name: "configs",
                data: makeConfig(),
                dataType: enums_1.DataType_s.object,
            });
            expect(() => {
                f.addTree({ name: "configs" });
            }).toThrow();
            const firstTree = f.addTree({
                name: "configs",
                upsert: true,
                data: {},
                dataType: enums_1.DataType_s.object,
            });
            expect(firstTree.get("apiUrl")).toBe(makeConfig().apiUrl); // the first tree with config value is used
        });
        it("should add a tree with no props", () => {
            const f = new Forest_1.Forest();
            f.addTree({ name: "configs", dataType: enums_1.DataType_s.object });
            expect(f.hasTree("configs")).toBe(true);
            expect(f.get({ treeName: "configs", key: "apiUrl" }).hasValue).toBe(false);
        });
        it("should add a tree with a value", () => {
            const f = new Forest_1.Forest();
            f.addTree({
                name: "configs",
                dataType: enums_1.DataType_s.object,
                data: makeConfig(),
            });
            expect(f.hasTree("configs")).toBe(true);
            expect(f.tree("congigs")?.values()).toEqual(makeConfig());
        });
    });
});
