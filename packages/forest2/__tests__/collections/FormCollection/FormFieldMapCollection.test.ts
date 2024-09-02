import { expect, it, describe } from "@jest/globals";
import type {
  FieldIF,
  FieldError,
  FormCollectionIF,
  FieldMap,
} from "../../../src/collections/FormCollection/types.formCollection";
import { FormFieldMapCollection } from "../../../src/collections/FormCollection/FormFieldMapCollection";
import { Forest } from "../../../src/Forest";

function isString(field: FieldIF) {
  if (!field.value && !field.isRequired) return null;
  if (typeof field.value !== "string") {
    return {
      message: "must be a string",
      severity: 10,
    };
  }
}

const NO_EMPTY_CHARS = "must not have empty characters";
function isSingleWord(field: FieldIF, errors: FieldError[]) {
  if (errors.length) {
    return null;
  }
  const { value } = field;
  const s = value as string;
  if (/\s+/.test(s)) {
    return {
      message: NO_EMPTY_CHARS,
      severity: 2,
    };
  }
}
const commonUserNames = "john,user,username,companyname".split(",");
const IS_TOO_COMMON = "is too common";
const IS_REQUIRED = "required";

function isCommonUserName(field: FieldIF, errors: FieldError[]) {
  if (errors.length) return null;
  const { value } = field;
  const s = value as string;
  if (commonUserNames.includes(s.toLowerCase())) {
    return {
      message: IS_TOO_COMMON,
      severity: 1,
    };
  }
}

function isRequired(field: FieldIF) {
  if (field.isRequired && !field.value) {
    return {
      message: IS_REQUIRED,
      severity: 3,
    };
  }
}

const TOO_SHORT = "field must be 8 or more characters";
function minLength(field: FieldIF, errors: FieldError[]) {
  if (errors.length || typeof field.value !== "string") return;
  if (field.value.length < 8)
    return {
      message: TOO_SHORT,
      severity: 5,
    };
}
const commonPasswords = "password,abc123".split(",");

function isCommonPassword(field: FieldIF, errors: FieldError[]) {
  if (errors.length) return null;
  const { value } = field;
  const s = value as string;
  if (commonPasswords.includes(s.toLowerCase())) {
    return {
      message: IS_TOO_COMMON,
    };
  }
}

const makeFields = (
  values: Record<string, string | number> = {
    username: "John",
    password: "foo bar",
  }
) =>
  new Map<string, FieldIF>([
    ["username", { name: "username", value: values["username"] ?? "" }],
    [
      "password",
      {
        name: "password",
        value: values["password"] ?? "",
      },
    ],
  ]);

const makeMockFormCollection = (): FormCollectionIF => ({
  forest: new Forest(),
  fieldBaseParams: new Map([
    [
      "username",
      {
        label: "User Name",
        isRequired: true,
        validators: [isRequired, isString, isSingleWord, isCommonUserName],
      },
    ],
    [
      "password",
      {
        isRequired: true,
        label: "Password",
        validators: [
          isRequired,
          isString,
          isSingleWord,
          isCommonPassword,
          minLength,
        ],
      },
    ],
  ]),
});

describe("FormFieldMapCollection", () => {
  it("should reflect the input", () => {
    const formFieldMapCollection = new FormFieldMapCollection(
      "user-login-form",
      makeFields(),
      makeMockFormCollection()
    );
    expect(
      (formFieldMapCollection.value as FieldMap).get("username")?.value
    ).toBe("John");
    expect(
      (formFieldMapCollection.value as FieldMap).get("password")?.value
    ).toBe("foo bar");
  });

  it("should have the proper error messages", () => {
    const formFieldMapCollection = new FormFieldMapCollection(
      "user-login-form",
      makeFields(),
      makeMockFormCollection()
    );
    expect(
      (formFieldMapCollection.value as FieldMap).get("username")?.errors
    ).toEqual([
      {
        message: IS_TOO_COMMON,
        severity: 1,
      },
    ]);
    expect(
      (formFieldMapCollection.value as FieldMap).get("password")?.errors
    ).toEqual([
      {
        message: NO_EMPTY_CHARS,
        severity: 2,
      },
    ]);
  });
  it("should have the different errors with different values", () => {
    const formFieldMapCollection = new FormFieldMapCollection(
      "user-login-form",
      makeFields({ username: "", password: "bum" }),
      makeMockFormCollection()
    );
    expect(
      (formFieldMapCollection.value as FieldMap).get("username")?.errors
    ).toEqual([
      {
        message: IS_REQUIRED,
        severity: 3,
      },
    ]);
    expect(
      (formFieldMapCollection.value as FieldMap).get("password")?.errors
    ).toEqual([
      {
        message: TOO_SHORT,
        severity: 5,
      },
    ]);
  });
});
