import { expect, it, describe } from "@jest/globals";
import { Forest, FormCollection } from "../../../lib";
import type {
  FieldError,
  FieldIF,
  FieldRecord,
} from "../../../src/collections/FormCollection/types.formCollection";
import {
  isLongEnough,
  isString,
} from "../../../src/collections/FormCollection/utils";

const MUST_BE_EMAIL = 'must be email format: "___@__.__';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(f: FieldIF, errors: FieldError[]) {
  if (errors.length) return;

  if (!EMAIL_RE.test(f.value as string)) {
    return {
      message: MUST_BE_EMAIL,
      severity: 5,
    };
  }
}

const COMMENT_FIELDS: FieldRecord = {
  title: {
    name: "title",
    value: "",
    baseParams: {
      label: "Message Title",
      validators: [isString, isLongEnough],
      isRequired: true,
    },
  },
  content: {
    name: "content",
    value: "",
    baseParams: {
      label: "Message",
      isRequired: true,
      validators: [isString, isLongEnough],
    },
  },
  authorEmail: {
    name: "authorEmail",
    value: "",
    baseParams: {
      label: "Author eMail",
      isRequired: true,
      validators: [isString, isEmail],
    },
  },
};
describe("FormCollection", () => {
  it("has all the initial values", () => {
    const f = new Forest();

    const fm = new FormCollection("comment", COMMENT_FIELDS, {
      forest: f,
    });

    expect([...fm.value.fields.keys()]).toEqual([
      "title",
      "content",
      "authorEmail",
    ]);
    expect([...fm.value.fields.values()].map((f) => f.value)).toEqual([
      "",
      "",
      "",
    ]);
    expect([...fm.value.fields.values()].map((f) => f.errors)).toEqual([
      [
        {
          message: "field must be 8 or more characters",
          severity: 5,
        },
      ],
      [
        {
          message: "field must be 8 or more characters",
          severity: 5,
        },
      ],
      [
        {
          message: 'must be email format: "___@__.__',
          severity: 5,
        },
      ],
    ]);
  });

  describe("setFieldValue", () => {
    it("can update with values", () => {
      const f = new Forest();

      const fm = new FormCollection("comment", COMMENT_FIELDS, {
        forest: f,
      });
      fm.setFieldValue("title", "Great Expectations");
      fm.setFieldValue("authorEmail", "foo@bar.com");

      expect([...fm.value.fields.keys()]).toEqual([
        "content",
        "title",
        "authorEmail",
      ]);

      expect([...fm.value.fields.values()].map((f) => f.value)).toEqual([
        "",
        "Great Expectations",
        "foo@bar.com",
      ]);

      expect([...fm.value.fields.values()].map((f) => f.edited)).toEqual([
        undefined,
        true,
        true,
      ]);
      const errors = [...fm.value.fields.values()].map((f) => f.errors);
      expect(errors).toEqual([
        [{ message: "field must be 8 or more characters", severity: 5 }],
        [],
        [],
      ]);
    });
  });

  describe("updateFieldProperty", () => {
    const f = new Forest();

    const fm = new FormCollection("comment", COMMENT_FIELDS, {
      forest: f,
    });

    fm.updateFieldProperty("content", "label", "Content");

    expect(fm.field("content")?.label).toBe("Content");
  });

  describe("commit", () => {
    it("should commit a single named field", () => {
      const f = new Forest();

      const fm = new FormCollection("comment", COMMENT_FIELDS, {
        forest: f,
      });
      fm.commit("title");

      expect([...fm.value.fields.keys()]).toEqual([
        "content",
        "authorEmail",
        "title",
      ]);

      expect([...fm.value.fields.values()].map((f) => f.committed)).toEqual([
        ,
        ,
        true,
      ]);
    });
    it("should commit all fields without arguemnts", () => {
      const f = new Forest();

      const fm = new FormCollection("comment", COMMENT_FIELDS, {
        forest: f,
      });
      fm.commit();

      expect([...fm.value.fields.values()].map((f) => f.committed)).toEqual([
        true,
        true,
        true,
      ]);
    });
  });
});