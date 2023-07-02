import { CanDI } from '../lib'

describe('CanDI', () => {
  describe('constructor', () => {
    it('operates without arguments', ()  => {
      const can = new CanDI;
      expect(can.has('foo')).toBeFalsy();
    });

    it('accepts value types', () => {
      const can = new CanDI([
        { name: 'foo', value: '1' },
        { name: 'bar', value: '2' }
      ]);

      console.log('can is ', can);
      expect(can.has('foo')).toBeTruthy();
    });
  });
});
