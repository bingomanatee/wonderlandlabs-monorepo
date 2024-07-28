import { A } from "@svgdotjs/svg.js";
import { ACTION_NAME_INITIALIZER } from "../constants";
import { MutatorArgs, MutatorIF, BranchIF, EngineIF, TreeSeed } from "../types";
import { Branch } from "../Branch";
import Forest from "../Forest";
import { dataEngineBasic } from "../engines/engineBasic";

const fibInitializer: MutatorIF = {
  name: ACTION_NAME_INITIALIZER,
  mutator(branch: BranchIF, data: MutatorArgs) {
    const [init] = data;
    if (init === undefined) return 0;
    return init;
  },
};

const fibNext: MutatorIF = {
  name: "next",
  mutator(branch: BranchIF) {
    const p1 = branch.prev;
    if (!p1) return 0;
    const p2 = p1.prev;
    if (!p2) {
      if (p1.value === 0) return 1;
      return p1.value;
    }
    return (p1.value as number) + (p2.value as number);
  },
};

const fibEngine: EngineIF = {
  name: "fib",
  actions: new Map([
    [ACTION_NAME_INITIALIZER, fibInitializer],
    ["next", fibNext],
  ]),
};

describe("Tree", () => {
  describe("basic series", () => {
    it("should allow the value to be replaced", () => {
      const f = new Forest([dataEngineBasic]);
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
        const f = new Forest([fibEngine]);
        const t = f.tree("fromZero", { engineName: "fib" });
        expect(t.value).toBe(0);
      });

      it("should allow a value to be seeded", () => {
        const f = new Forest([fibEngine]);
        const t = f.tree("from100", { engineName: "fib", val: 100 });
        expect(t.value).toBe(100);
      });
    });

    describe("next values", () => {
      it("should increase by the fibonacci scale", () => {
        const f = new Forest([fibEngine]);
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
        const f = new Forest([fibEngine]);
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
        const f = new Forest([fibEngine]);
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
