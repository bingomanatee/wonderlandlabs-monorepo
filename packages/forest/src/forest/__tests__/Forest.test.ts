import Forest from '../../../lib/forest/Forest';

describe('@wonderlandlabs/forest', () => {
  describe('Forest', () => {
    describe('constructor', () => {
      it('should not have unknown tables', () => {
        const forest = new Forest();
        expect(forest.has('foo')).toBeFalsy();
      });
    });

    describe('addTable', () => {
      const forest = new Forest();
      forest.addTable('foo', new Map());

      expect(forest.has('foo')).toBeTruthy();
    });
  });
});
