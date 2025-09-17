import { expect, it, describe } from 'vitest';
import { FieldExtended } from '../../../../build/src/collections/FormCollection/FieldExtended.js';

describe('FieldExtended', () => {
  it('should reflect simple qualities of the field', () => {
    const testField = { name: 'comme', value: 'foo' };

    const ex = new FieldExtended(testField, testField.name, {
      fieldBaseParams: new Map(),
    });

    expect(ex.name).toBe(testField.name);
    expect(ex.value).toBe(testField.value);
    expect(ex.errors).toEqual([]);
    expect(ex.isRequired).toBeFalsy();
    expect(ex.order).toBeUndefined();
    expect(ex.label).toBeUndefined();
  });

  it('should reflect inherited properties of the static props of the $parent', () => {
    const testField = {
      name: 'comme',
      value: 'foo',
      props: { className: 'comment-class' },
    };
    const baseParams = {
      label: 'Comme',
      className: 'override-me',
    };
    const ex = new FieldExtended(testField, testField.name, {
      fieldBaseParams: new Map([['comme', baseParams]]),
    });

    expect(ex.name).toBe(testField.name);
    expect(ex.value).toBe(testField.value);
    expect(ex.errors).toEqual([]);
    expect(ex.isRequired).toBeFalsy();
    expect(ex.order).toBeUndefined();
    expect(ex.props?.className).toBe(testField.props.className);
    expect(ex.label).toBe('Comme');
  });
});
