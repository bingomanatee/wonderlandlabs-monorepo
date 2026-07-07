import { engineForm } from "../../engines/form/engineForm";
import Forest from "../../Forest";

describe("engineForm", () => {
  describe("initialization", () => {
    it("has the right form props", () => {
      const f = new Forest([engineForm]);

      const myForm = f.tree("myForm", {
        engineName: "form",
        val: {},
      });

      expect(myForm.engineName).toBe("form");
    });
  });
});
