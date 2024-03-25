import Forest from './../../lib/Forest';

describe('forest', () => {
  describe('Forest', () => {
    describe('createBranch()', () => {
      it('should describe a forest with a name in config', () => {
        const f = new Forest();

        const br = f.createBranch({ name: 'point', $value: { x: 0, y: 0 } });

        expect(br.name).toBe('point');
      });
    });
  });
});
