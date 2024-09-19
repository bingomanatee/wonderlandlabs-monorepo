import { expect, it, describe } from 'vitest';
import { FormFieldMapCollection } from '../../../../src/collections/FormCollection/FormFieldMapCollection';
import type { FieldMap } from '../../../../src/collections/FormCollection/types.formCollection';
import {
  makeFields,
  makeMockFormCollection,
  IS_TOO_COMMON,
  NO_EMPTY_CHARS,
  IS_REQUIRED,
  TOO_SHORT,
} from '../../../../src/collections/FormCollection/utils';

describe('FormFieldMapCollection', () => {
  it('should reflect the input', () => {
    const formFieldMapCollection = new FormFieldMapCollection(
      'user-login-form',
      makeFields(),
      makeMockFormCollection()
    );
    expect(
      (formFieldMapCollection.value as FieldMap).get('username')?.value
    ).toBe('John');
    expect(
      (formFieldMapCollection.value as FieldMap).get('password')?.value
    ).toBe('foo bar');
  });

  it('should have the proper error messages', () => {
    const formFieldMapCollection = new FormFieldMapCollection(
      'user-login-form',
      makeFields(),
      makeMockFormCollection()
    );
    expect(
      (formFieldMapCollection.value as FieldMap).get('username')?.errors
    ).toEqual([
      {
        message: IS_TOO_COMMON,
        severity: 1,
      },
    ]);
    expect(
      (formFieldMapCollection.value as FieldMap).get('password')?.errors
    ).toEqual([
      {
        message: NO_EMPTY_CHARS,
        severity: 2,
      },
    ]);
  });
  it('should have the different errors with different values', () => {
    const formFieldMapCollection = new FormFieldMapCollection(
      'user-login-form',
      makeFields({ username: '', password: 'bum' }),
      makeMockFormCollection()
    );
    expect(
      (formFieldMapCollection.value as FieldMap).get('username')?.errors
    ).toEqual([
      {
        message: IS_REQUIRED,
        severity: 3,
      },
    ]);
    expect(
      (formFieldMapCollection.value as FieldMap).get('password')?.errors
    ).toEqual([
      {
        message: TOO_SHORT,
        severity: 5,
      },
    ]);
  });
});
