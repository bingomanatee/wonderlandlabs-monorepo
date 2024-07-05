import { type, NumberEnum } from "./../dist";
import type { TypeDef } from "../dist/type";

describe("walrus", () => {
  describe("type", () => {
    it("detection", () => {
      expect((type.describe(undefined) as TypeDef).type).toBe("undefined");
      expect((type.describe(true) as TypeDef).type).toBe("boolean");
      expect((type.describe(Symbol("foo")) as TypeDef).type).toBe("symbol");
      expect((type.describe(() => {}) as TypeDef).type).toBe("function");
      expect((type.describe(null) as TypeDef).type).toBe("null");
      expect((type.describe(0) as TypeDef).type).toBe("number");
      expect((type.describe("123") as TypeDef).type).toBe("string");
      expect((type.describe(["123"]) as TypeDef).type).toBe("array");
      expect((type.describe({ foo: "bar" }) as TypeDef).type).toBe("object");
      expect((type.describe(new Map([["foo", "bar"]])) as TypeDef).type).toBe(
        "map",
      );
    });
  });

  it("describeNumber", () => {
    expect(type.describeNumber("foo")).toBe(NumberEnum.nan);
    expect(type.describeNumber(1)).toBe(NumberEnum.integer);
    expect(type.describeNumber(2.4)).toBe(NumberEnum.decimal);
    expect(type.describeNumber(Number.POSITIVE_INFINITY)).toBe(
      NumberEnum.infinite,
    );
  });

  it.skip("documentation", () => {
    console.log("type.describe(null) = ", JSON.stringify(type.describe(null)));
    console.log("type.describe(3) = ", JSON.stringify(type.describe(3)));
    console.log("type.describe([]) = ", JSON.stringify(type.describe([])));

    console.log(
      "type.describe(null, true) = ",
      JSON.stringify(type.describe(null, true)),
    );
    console.log(
      "type.describe(3, true) = ",
      JSON.stringify(type.describe(3, true)),
    );
    console.log(
      "type.describe([], true) = ",
      JSON.stringify(type.describe([], true)),
    );

    console.log(
      'type.describe(null, "family") = ',
      JSON.stringify(type.describe(null, "family")),
    );
    console.log(
      'type.describe(3, "family") = ',
      JSON.stringify(type.describe(3, "family")),
    );
    console.log(
      'type.describe([], "family") = ',
      JSON.stringify(type.describe([], "family")),
    );
  });
});
