import Forest from "../Forest";
import { dataEngineBasic } from "../engines/engineBasic";

describe("Forest", () => {
  describe(".tree", () => {
    it("should throw if missing tree requested", () => {
      const f = new Forest([dataEngineBasic]);
      expect(() => f.tree("foo")).toThrow();
    });

    it("should define a tree if seeded", () => {
      const f = new Forest([dataEngineBasic]);
      const t = f.tree("foo", {
        engineName: "basic",
        val: "bar",
      });

      expect(t).toBeTruthy();
      expect(t.value).toBe("bar");
    });
  });
});
