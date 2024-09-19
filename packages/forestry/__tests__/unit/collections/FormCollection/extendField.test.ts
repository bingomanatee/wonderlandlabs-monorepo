import extendField from '../../../../src/collections/FormCollection/extendField';
import {
  isLongEnough,
  isNotCommonPassword,
  isString,
  TOO_SHORT,
} from '../../../../src/collections/FormCollection/utils';
import { expect, it, describe } from 'vitest';

describe('extendField', () => {
  it('should preserve a single field with no history', () => {
    const testField = { name: 'comme', value: 'foo' };

    const ex = extendField(testField);

    expect(ex.name).toBe(testField.name);
    expect(ex.value).toBe(testField.value);
    expect(ex.errors).toBeUndefined();
    expect(ex.isRequired).toBeFalsy();
    expect(ex.order).toBeUndefined();
    expect(ex.label).toBeUndefined();
  });

  it('should reflect inherited properties of the static props of the parent', () => {
    const testField = {
      name: 'comme',
      value: 'foo',
      props: { className: 'comment-class' },
      baseParams: {
        label: 'Comme',
        className: 'override-me',
      },
    };

    const ex = extendField(testField);

    expect(ex.name).toBe(testField.name);
    expect(ex.value).toBe(testField.value);
    expect(ex.errors).toBeUndefined();
    expect(ex.isRequired).toBeFalsy();
    expect(ex.order).toBeUndefined();
    expect(ex.props?.className).toBe(testField.props.className);
    expect(ex.label).toBe('Comme');
  });

  it('should execute validators', () => {
    const testField = {
      name: 'password',
      value: 'foo',
      props: { className: 'comment-class' },
      baseParams: {
        label: 'Comme',
        className: 'override-me',
        validators: [ isString, isLongEnough, isNotCommonPassword ],
      },
    };

    const ex = extendField(testField);

    expect(ex.name).toBe(testField.name);
    expect(ex.value).toBe(testField.value);
    expect(ex.errors).toEqual([ { message: TOO_SHORT, severity: 5 } ]);
    expect(ex.isRequired).toBeFalsy();
    expect(ex.order).toBeUndefined();
    expect(ex.props?.className).toBe(testField.props.className);
    expect(ex.label).toBe('Comme');
  });
});
