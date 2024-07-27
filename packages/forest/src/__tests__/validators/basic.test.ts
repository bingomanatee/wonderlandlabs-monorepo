import Forest from "../../Forest";
import { dataEngineBasic } from "../../engines/dataEngine/dataEngineBasic";

describe("validators", () => {
  it("should not block valid data", () => {
    const f = new Forest([dataEngineBasic]);

    const t = f.tree("foo", {
      engineName: "basic",
      val: 0,
      validator(value: unknown) {
        if (typeof value !== value) throw new Error("must be of type number");
        if (Number.isNaN(value)) throw new Error("vaule must be a number");
      },
    });
    expect(t.value).toBe(0);
  });
});
