import Forest from "../../Forest";

import { dataEngineMap } from "../../engines/dataEngine/dataEngineMap";
import { GenericMap } from "../../engines/dataEngine/dataEngineTypes";
import { MapSrc } from "../../types";

const FOO_BAR: Map<any, any> = new Map([
  ["foo", "vey"],
  ["bar", 200],
] as MapSrc);

const NEW_DATA: Map<unknown, unknown> = new Map([
  ["foo", "vey"],
  ["bar", 300],
] as MapSrc);

describe("DistMap", () => {
  describe("set", () => {
    it("should allow you to set individual values", () => {
      const f = new Forest([dataEngineMap]);
      const pips = f.tree("pips", {
        engineName: "map",
        val: new Map(),
      });
      expect((pips.value as Map<unknown, unknown>).has("foo")).toBeFalsy();
      pips.acts.set({ key: "foo", val: "bar" });
      expect((pips.value as GenericMap).has("foo")).toBeTruthy();
      expect((pips.value as GenericMap).get("foo")).toEqual("bar");
    });

    it("should allow you to set reset values", () => {
      const f = new Forest([dataEngineMap]);
      const pips = f.tree("pips", {
        engineName: "map",
        val: new Map([["foo", "vey"]]),
      });
      expect((pips.value as Map<unknown, unknown>).has("foo")).toBeTruthy();
      pips.acts.set({ key: "foo", val: "bar" });
      expect((pips.value as GenericMap).has("foo")).toBeTruthy();
      expect((pips.value as GenericMap).get("foo")).toEqual("bar");
      pips.acts.set({ key: "foo", val: "Hippo" });
      expect((pips.value as GenericMap).get("foo")).toEqual("Hippo");
    });
  });

  describe("delete", () => {
    const f = new Forest([dataEngineMap]);
    const pips = f.tree("pips", {
      engineName: "map",
      // @ts-ignore
      val: new Map([
        ["foo", "vey"],
        ["bar", 200],
      ]) as GenericMap,
    });
    expect((pips.value as GenericMap).size).toBe(2);
    pips.acts.delete({ delKey: "bar" });
    expect((pips.value as GenericMap).size).toBe(1);
    expect((pips.value as GenericMap).has("bar")).toBeFalsy();

    pips.acts.set({ key: "bar", val: 300 });
    expect((pips.value as GenericMap).size).toBe(2);
    expect((pips.value as GenericMap).has("bar")).toBeTruthy();
    expect((pips.value as GenericMap).get("bar")).toEqual(300);
  });

  describe("patch", () => {
    it("should allow a patch", () => {
      const f = new Forest([dataEngineMap]);
      const pips = f.tree("pips", {
        engineName: "map",
        // @ts-ignore
        val: new Map(FOO_BAR) as GenericMap,
      });

      pips.acts.patch([
        ["bar", 300],
        ["vey", "foo"],
      ]);

      expect(pips.value).toEqual(
        new Map([
          ["foo", "vey"],
          ["bar", 300],
          ["vey", "foo"],
        ] as MapSrc)
      );

      pips.acts.set("vey", 400);

      expect(pips.value).toEqual(
        new Map<unknown, unknown>([
          ["foo", "vey"],
          ["bar", 300],
          ["vey", 400],
        ] as MapSrc)
      );
    });
  });

  describe("replace", () => {
    it("should allow a replace", () => {
      const f = new Forest([dataEngineMap]);
      const pips = f.tree("pips", {
        engineName: "map",
        // @ts-ignore
        val: new Map(FOO_BAR) as GenericMap,
      });

      pips.acts.replace(NEW_DATA);

      expect(pips.value).toEqual(NEW_DATA);

      pips.acts.set("vey", 400);
      //@ts-ignore
      expect(pips.value).toEqual(
        new Map<unknown, unknown>([
          ["foo", "vey"],
          ["bar", 300],
          ["vey", 400],
        ])
      );
    });
  });
});
