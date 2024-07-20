import { A } from "@svgdotjs/svg.js";
import { ACTION_NAME_INITIALIZER } from "../constants";
import {
  ActionDeltaArgs,
  ActionIF,
  BranchIF,
  DataEngineIF,
  TreeSeed,
} from "../types";
import { Branch } from "../Branch";
import Forest from "../Forest";
import { dataEngineBasic } from "../engines/dataEngine/dataEngineBasic";

const fibInitializer: ActionIF = {
  name: ACTION_NAME_INITIALIZER,
  delta(branch: BranchIF, data: ActionDeltaArgs) {
    const [init] = data;
    if (init === undefined) return 0;
    return init;
  },
};

const fibNext: ActionIF = {
  name: "next",
  delta(branch: BranchIF) {
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

const fibEngine: DataEngineIF = {
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
        dataEngine: "basic",
        val: 100,
      });

      expect(tree.value).toBe(100);
      tree.do("set", 200);
      expect(tree.value).toBe(200);
    });
  });
  describe("fibonacci series", () => {
    describe("initial value", () => {
      it("should have the intial value determined by its initializer", () => {
        const f = new Forest([fibEngine]);
        const t = f.tree("fromZero", { dataEngine: "fib" });
        expect(t.value).toBe(0);
      });

      it("should allow a value to be seeded", () => {
        const f = new Forest([fibEngine]);
        const t = f.tree("from100", { dataEngine: "fib", val: 100 });
        expect(t.value).toBe(100);
      });
    });

    describe("next values", () => {
      it("should increase by the fibonacci scale", () => {
        const f = new Forest([fibEngine]);
        const t = f.tree("fromZero", { dataEngine: "fib" });
        t.do("next");
        expect(t.value).toBe(1);
        t.do("next");
        expect(t.value).toBe(1);
        t.do("next");
        expect(t.value).toBe(2);
        t.do("next");
        expect(t.value).toBe(3);
        t.do("next");
        expect(t.value).toBe(5);
        t.do("next");
        expect(t.value).toBe(8);
        t.do("next");
        expect(t.value).toBe(13);
      });

      it("should increase based on the seed", () => {
        const f = new Forest([fibEngine]);
        const t = f.tree("from100", { dataEngine: "fib", val: 100 });
        t.do("next");
        expect(t.value).toBe(100);
        t.do("next");
        expect(t.value).toBe(200);
        t.do("next");
        expect(t.value).toBe(300);
        t.do("next");
        expect(t.value).toBe(500);
        t.do("next");
        expect(t.value).toBe(800);
        t.do("next");
        expect(t.value).toBe(1300);
      });

      it("should increase based on a negative seed", () => {
        const f = new Forest([fibEngine]);
        const t = f.tree("fromNeg1", { dataEngine: "fib", val: -1 });

        expect(t.value).toBe(-1);
        t.do("next");
        expect(t.value).toBe(-1);
        t.do("next");
        expect(t.value).toBe(-2);
        t.do("next");
        expect(t.value).toBe(-3);
        t.do("next");
        expect(t.value).toBe(-5);
        t.do("next");
        expect(t.value).toBe(-8);
        t.do("next");
        expect(t.value).toBe(-13);
      });
    });
  });
});
