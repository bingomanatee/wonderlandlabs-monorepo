import { expect, it, describe } from "@jest/globals";
import extendField from "../../../src/collections/FormCollection/extendField";
import {
  isLongEnough,
  isNotCommonPassword,
  isString,
  TOO_SHORT,
} from "../../../src/collections/FormCollection/utils";

describe("extendField", () => {
  it("should preserve a single field with no history", () => {
    const testField = { name: "comments", value: "foo" };

    const ex = extendField(testField);

    expect(ex.name).toBe(testField.name);
    expect(ex.value).toBe(testField.value);
    expect(ex.errors).toBeUndefined();
    expect(ex.isRequired).toBeFalsy();
    expect(ex.order).toBeUndefined();
    expect(ex.label).toBeUndefined();
  });

  it("should reflect inherited properties of the static props of the parent", () => {
    const testField = {
      name: "comments",
      value: "foo",
      props: { className: "comment-class" },
      baseParams: {
        label: "Comments",
        className: "override-me",
      },
    };

    const ex = extendField(testField);

    expect(ex.name).toBe(testField.name);
    expect(ex.value).toBe(testField.value);
    expect(ex.errors).toBeUndefined();
    expect(ex.isRequired).toBeFalsy();
    expect(ex.order).toBeUndefined();
    expect(ex.props?.className).toBe(testField.props.className);
    expect(ex.label).toBe("Comments");
  });

  it("should execute validators", () => {
    const testField = {
      name: "password",
      value: "foo",
      props: { className: "comment-class" },
      baseParams: {
        label: "Comments",
        className: "override-me",
        validators: [isString, isLongEnough, isNotCommonPassword],
      },
    };

    const ex = extendField(testField);

    expect(ex.name).toBe(testField.name);
    expect(ex.value).toBe(testField.value);
    expect(ex.errors).toEqual([{ message: TOO_SHORT, severity: 5 }]);
    expect(ex.isRequired).toBeFalsy();
    expect(ex.order).toBeUndefined();
    expect(ex.props?.className).toBe(testField.props.className);
    expect(ex.label).toBe("Comments");
  });
});