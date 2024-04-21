import { Forest } from '../../lib';

describe('forest', () => {
  describe('Branch', () => {
    describe('creation, basic functionality', () => {
      it('should be created with minimal config', () => {
        const f = new Forest();
        const b = f.createBranch({ $value: 1, name: 'one' });
        expect(b.name).toBe('one');
        expect(b.value).toBe(1);
      });

      it('should be created with custom config', () => {
        const f = new Forest();
        const b = f.createBranch({ $value: 2, name: 'two', color: 'blue' });
        expect(b.value).toBe(2);

        b.value = 3;

        expect(b.value).toBe(3);
      });
      it('should throw an error if created without a value', () => {
        const f = new Forest();
        expect(() => {
          f.createBranch({ name: 'one' });
        }).toThrowError('bad configuration');
      });
    });

    describe('validation', () => {
      it('should prevent changing a value to a different type of item', () => {
        const f = new Forest();
        const b = f.createBranch({ $value: 1, name: 'one' });
        expect(() => {
          b.value = 'two';
        }).toThrowError('Cannot change type of Branch');
      });
    });
  });
});
