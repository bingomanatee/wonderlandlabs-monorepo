import { Forest } from "../src/Forest";
import type { BranchIF } from "../src/types/types.branch";
import type { TreeIF } from "../src/types/types.trees";
import { expect, it, describe } from "@jest/globals";

describe("tree", () => {
  it("should update values", () => {
    const f = new Forest();

    const t = f.addTree<number>("bar", { initial: 100 });

    t.next(200);

    expect(t.value).toBe(200);
  });
  it("should update values(function) ", () => {
    const f = new Forest();

    const t = f.addTree<number>("bar", { initial: 100 });

    t.grow({
      name: "multiply",
      mutator({ value }) {
        return value === undefined ? 0 : 2 * value;
      },
    });

    expect(t.value).toBe(200);
  });

  it("should reflect validation", () => {
    const f = new Forest();

    const t = f.addTree<number>("bar", {
      initial: 100,
      validator(n: number) {
        if (n < 0) return new Error("must be positive");
        if (n !== n - (n % 1)) {
          throw new Error("must be a whole number");
        }
      },
    });

    t.next(200);
    expect(t.value).toBe(200);

    expect(() => t.next(-1, "next (error)")).toThrow("must be positive");
    expect(() => t.next(0.5, "next (error)")).toThrow("must be a whole number");

    expect(t.value).toBe(200);
    t.next(300);
    expect(t.value).toBe(300);
  });

  describe("subscribe", () => {
    it("should allow subscription on a populated tree", () => {
      const f = new Forest();

      const t = f.addTree<number>("bar", {
        initial: 100,
      });

      const out: number[] = [];

      t.subscribe((v: number) => out.push(v));

      expect(out).toEqual([100]);

      t.next(300);
      expect(out).toEqual([100, 300]);
    });

    it("should allow subscription on an unpopulted tree", () => {
      const f = new Forest();

      const t = f.addTree<number>("bar", {});

      const out: number[] = [];

      t.subscribe((v: number) => out.push(v));

      expect(out).toEqual([]);

      t.next(300);
      expect(out).toEqual([300]);
    });
  });

  describe("atTime", () => {
    const f = new Forest();

    const alpha = f.addTree<string>("alpha", { initial: "" });
    const beta = f.addTree<string>("beta", { initial: "" });
    const gamma = f.addTree<string>("gamma", { initial: "" });

    alpha.next("a");
    beta.next("b");
    gamma.next("c");

    alpha.next("d1");
    beta.next("d2");

    beta.next("e1");
    gamma.next("e2");

    let backwards: string[] = [];

    for (let time = f.time; time >= 0; time -= 1) {
      backwards.push(
        `${time} alpha=${alpha.valueAt(time)}, beta=${beta.valueAt(
          time
        )}, gamma=${gamma.valueAt(time)}`
      );
    }

    expect(backwards).toEqual([
      "17 alpha=d1, beta=e1, gamma=e2",
      "16 alpha=d1, beta=e1, gamma=c",
      "15 alpha=d1, beta=e1, gamma=c",
      "14 alpha=d1, beta=d2, gamma=c",
      "13 alpha=d1, beta=d2, gamma=c",
      "12 alpha=d1, beta=b, gamma=c",
      "11 alpha=d1, beta=b, gamma=c",
      "10 alpha=a, beta=b, gamma=c",
      "9 alpha=a, beta=b, gamma=c",
      "8 alpha=a, beta=b, gamma=",
      "7 alpha=a, beta=b, gamma=",
      "6 alpha=a, beta=, gamma=",
      "5 alpha=a, beta=, gamma=",
      "4 alpha=, beta=, gamma=",
      "3 alpha=, beta=, gamma=",
      "2 alpha=, beta=, gamma=undefined",
      "1 alpha=, beta=undefined, gamma=undefined",
      "0 alpha=undefined, beta=undefined, gamma=undefined",
    ]);
  });

  describe("notes", () => {
    it("should add notes without params", () => {
      const f = new Forest();

      const t = f.addTree<string>("foo", { initial: "" });
      expect(t.notes(0, Number.MAX_SAFE_INTEGER)).toEqual([]);

      t.addNote("starts blank");
      expect(t.notes(0, Number.MAX_SAFE_INTEGER)).toEqual([
        { time: 1, message: "starts blank", tree: "foo", params: undefined },
      ]);

      t.next("a");
      t.next("b");

      t.addNote("is at b");

      expect(t.notes(0, Number.MAX_SAFE_INTEGER)).toEqual([
        { time: 1, message: "starts blank", tree: "foo", params: undefined },
        { time: 5, message: "is at b", tree: "foo", params: undefined },
      ]);
    });
  });
});
