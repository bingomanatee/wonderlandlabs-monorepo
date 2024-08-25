// @ts-ignore

import { Forest } from "../../src/Forest";
import MapCollection from "../../src/collections/MapCollection";

describe("MapCollection", () => {
  it("should allow a collection to be created with a map", () => {
    const f = new Forest();
    const mc = new MapCollection<string, number>("foo", {
      initial: new Map<string, number>([
        ["a", 1],
        ["b", 2],
      ]),
    });

    expect(mc.get("a")).toBe(1);

    expect(mc.get("c")).toBeUndefined();

    expect(mc.size).toBe(2);
  });

  it("should grow the collection with set", () => {
    const f = new Forest();
    const mc = new MapCollection<string, number>("foo", {
      initial: new Map<string, number>([
        ["a", 1],
        ["b", 2],
      ]),
    });

    mc.set("c", 30);

    expect(mc.get("a")).toBe(1);

    expect(mc.get("c")).toBe(30);

    expect(mc.size).toBe(3);

    const keys: string[] = [];
    for (const k of mc.keys()) {
      keys.push(k);
    }

    expect(keys).toEqual(["a", "b", "c"]);
  });
  describe("keys", () => {
    it("should allow a collection to be created with a map", () => {
      const f = new Forest();
      const mc = new MapCollection<string, number>("foo", {
        initial: new Map<string, number>([
          ["a", 1],
          ["b", 2],
        ]),
      });

      expect(mc.get("a")).toBe(1);

      expect(mc.get("c")).toBeUndefined();

      expect(mc.size).toBe(2);

      const keys: string[] = [];

      for (const k of mc.keys()) {
        keys.push(k);
      }
      expect(keys).toEqual(["a", "b"]);
    });
  });
});
