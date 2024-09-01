import { FieldExtended } from "./../../../src/collections/FormCollection/FieldExtended";
import { expect, it, describe } from "@jest/globals";

describe("FieldExtended", () => {
  it("should reflect simple qualities of the field", () => {
    const testField = { name: "comments", value: "foo" };

    const ex = new FieldExtended(testField, testField.name, {});

    expect(ex.name).toBe(testField.name);
    expect(ex.value).toBe(testField.value);
    expect(ex.errors).toEqual([]);
    expect(ex.required).toBeFalsy();
    expect(ex.order).toBeUndefined();
    expect(ex.label).toBeUndefined();
  });

  it("should reflect inherited properties of the static props of the parent", () => {
    const testField = {
      name: "comments",
      value: "foo",
      props: { className: "comment-class" },
    };
    const staticProps = {
      label: "Comments",
      className: "override-me",
    };
    const ex = new FieldExtended(testField, testField.name, {
      staticProps: new Map([["comments", staticProps]]),
    });

    expect(ex.name).toBe(testField.name);
    expect(ex.value).toBe(testField.value);
    expect(ex.errors).toEqual([]);
    expect(ex.required).toBeFalsy();
    expect(ex.order).toBeUndefined();
    expect(ex.props?.className).toBe(testField.props.className);
    expect(ex.label).toBe("Comments");
  });
});
