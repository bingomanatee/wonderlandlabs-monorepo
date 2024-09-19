import { Forest } from '../../Forest';
import type {
  FieldIF,
  FieldError,
  FormCollectionIF,
} from './types.formCollection';

export function isString(field: FieldIF) {
  if (!field.value && !field.isRequired) {
    return null;
  }
  if (typeof field.value !== 'string') {
    return {
      message: 'must be a string',
      severity: 10,
    };
  }
  return null;
}

export const NO_EMPTY_CHARS = 'must not have empty characters';
export function isSingleWord(field: FieldIF, errors: FieldError[]) {
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
  return null;
}

export const commonUserNames = 'john,user,username,companyname'.split(',');
export const IS_TOO_COMMON = 'is too common';
export const IS_REQUIRED = 'required';
export function isCommonUserName(field: FieldIF, errors: FieldError[]) {
  if (errors.length) {
    return null;
  }
  const { value } = field;
  const s = value as string;
  if (commonUserNames.includes(s.toLowerCase())) {
    return {
      message: IS_TOO_COMMON,
      severity: 1,
    };
  }
  return null;
}

export function isRequired(field: FieldIF) {
  if (field.isRequired && !field.value) {
    return {
      message: IS_REQUIRED,
      severity: 3,
    };
  }
  return null;
}

export const TOO_SHORT = 'field must be 8 or more characters';
export function isLongEnough(field: FieldIF, errors: FieldError[]) {
  if (errors.length || typeof field.value !== 'string') {
    return null;
  }
  if (field.value.length < 8) {
    return {
      message: TOO_SHORT,
      severity: 5,
    };
  }
  return null;
}
export const commonPasswords = 'password,abc123'.split(',');

export function isNotCommonPassword(field: FieldIF, errors: FieldError[]) {
  if (errors.length) {
    return null;
  }
  const { value } = field;
  const s = value as string;
  if (commonPasswords.includes(s.toLowerCase())) {
    return {
      message: IS_TOO_COMMON,
    };
  }
  return null;
}

export const makeFields = (
  values: Record<string, string | number> = {
    username: 'John',
    password: 'foo bar',
  }
) =>
  new Map<string, FieldIF>([
    [ 'username', { name: 'username', value: values['username'] ?? '' } ],
    [
      'password',
      {
        name: 'password',
        value: values['password'] ?? '',
      },
    ],
  ]);

export const makeMockFormCollection = (): FormCollectionIF => ({
  forest: new Forest(),
  setFieldValue() {},
  updateFieldProperty() {},
  updateField() {},
  commit() {},
  hasField() {
    return false;
  },
  field() {
    return undefined;
  },
  fieldBaseParams: new Map([
    [
      'username',
      {
        label: 'User Name',
        isRequired: true,
        validators: [ isRequired, isString, isSingleWord, isCommonUserName ],
      },
    ],
    [
      'password',
      {
        isRequired: true,
        label: 'Password',
        validators: [
          isRequired,
          isString,
          isSingleWord,
          isNotCommonPassword,
          isLongEnough,
        ],
      },
    ],
  ]),
});
