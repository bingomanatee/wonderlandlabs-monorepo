import { ForestIF, LeafIF } from "../types";
//@ts-ignore
import { Forest } from "../Forest";
import { DataType_s } from "../helpers/enums";

type configType = {
  maxWidth: number;
  apiUrl: string;
  backgroundColor: string;
};

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
      const f: ForestIF = new Forest();

      expect(f.tree("configs")).toBeFalsy();
    });

    it("should return a tree", () => {
      //@ts-ignore
      const f: ForestIF = new Forest();

      f.addTree({ name: "configs" });
      expect(f.tree("configs")).toBeTruthy();
    });
  });

  // tests that hasTree mirrors the result of the tree being present
  describe(".hasTree()", () => {
    it("should return undefined for absent tree", () => {
      //@ts-ignore
      const f: ForestIF = new Forest();

      expect(f.hasTree("configs")).toBe(false);
    });
    it("should return a tree", () => {
      //@ts-ignore
      const f: ForestIF = new Forest();

      f.addTree({ name: "configs" });
      expect(f.hasTree("configs")).toBe(true);
    });
  });

  describe("addTree", () => {
    it("should throw if it is asked to duplicate an existing tree", () => {
      const f = new Forest();

      f.addTree({
        name: "configs",
        data: makeConfig(),
        dataType: DataType_s.object,
      });

      expect(() => {
        f.addTree({ name: "configs" });
      }).toThrow();

      const firstTree = f.addTree({
        name: "configs",
        upsert: true,
        data: {},
        dataType: DataType_s.object,
      });
      expect(firstTree.get("apiUrl")).toBe(makeConfig().apiUrl); // the first tree with config value is used
    });

    it("should add a tree with no props", () => {
      const f = new Forest();
      f.addTree({ name: "configs", dataType: DataType_s.object });
      expect(f.hasTree("configs")).toBe(true);
      expect(f.get({ treeName: "configs", key: "apiUrl" }).hasValue).toBe(
        false
      );
    });

    it("should add a tree with a value", () => {
      const f = new Forest();
      f.addTree({
        name: "configs",
        dataType: DataType_s.object,
        data: makeConfig(),
      });
      expect(f.hasTree("configs")).toBe(true);

      expect(f.tree("congigs")?.values()).toEqual(makeConfig());
    });
  });
});
