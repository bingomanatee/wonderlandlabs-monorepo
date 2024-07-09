import Forest from "../Forest";
import { dataEngineSeq } from "../engines/dataEngineSequential";

describe("Forest", () => {
  describe(".tree", () => {
    it("should throw if missing tree requested", () => {
      const f = new Forest([dataEngineSeq]);
      expect(() => f.tree("foo")).toThrow();
    });

    it("should define a tree if seeded", () => {
      const f = new Forest([dataEngineSeq]);
      const t = f.tree("foo", {
        dataEngine: "sequential",
        val: "bar",
      });

      expect(t).toBeTruthy();
      expect(t.value).toBe("bar");
    });
  });
});
