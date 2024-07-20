import Forest from "../Forest";

import { dataEngineDistMap } from "../engines/dataEngine/dataEngineDistMap";
import { DataEngineMap } from "../engines/dataEngine/dataEngineTypes";

describe("DistMap", () => {
  describe("set", () => {
    it("should allow you to set individual values", () => {
      const f = new Forest([dataEngineDistMap]);
      const pips = f.tree("pips", {
        dataEngine: "distMap",
        val: new Map(),
      });
      expect((pips.value as Map<unknown, unknown>).has("foo")).toBeFalsy();
      pips.do("set", { key: "foo", val: "bar" });
      expect((pips.value as DataEngineMap).has("foo")).toBeTruthy();
      expect((pips.value as DataEngineMap).get("foo")).toEqual("bar");
    });

    it("should allow you to set reset values", () => {
      const f = new Forest([dataEngineDistMap]);
      const pips = f.tree("pips", {
        dataEngine: "distMap",
        val: new Map([["foo", "vey"]]),
      });
      expect((pips.value as Map<unknown, unknown>).has("foo")).toBeTruthy();
      pips.do("set", { key: "foo", val: "bar" });
      expect((pips.value as DataEngineMap).has("foo")).toBeTruthy();
      expect((pips.value as DataEngineMap).get("foo")).toEqual("bar");
      pips.do("set", { key: "foo", val: "Hippo" });
      expect((pips.value as DataEngineMap).get("foo")).toEqual("Hippo");
    });
  });

  describe("delete", () => {
    const f = new Forest([dataEngineDistMap]);
    const pips = f.tree("pips", {
      dataEngine: "distMap",
      // @ts-ignore
      val: new Map([
        ["foo", "vey"],
        ["bar", 200],
      ]) as DataEngineMap,
    });
    expect((pips.value as DataEngineMap).size).toBe(2);
    pips.do("delete", { delKey: "bar" });
    expect((pips.value as DataEngineMap).size).toBe(1);
    expect((pips.value as DataEngineMap).has("bar")).toBeFalsy();
    pips.do("set", { key: "bar", val: 300 });
    expect((pips.value as DataEngineMap).size).toBe(2);
    expect((pips.value as DataEngineMap).has("bar")).toBeTruthy();
    expect((pips.value as DataEngineMap).get("bar")).toEqual(300);
  });
});
