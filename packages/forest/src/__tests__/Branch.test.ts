import { Forest } from '../../lib';

describe('forest', () => {
  describe('Branch', () => {
    it('should be created with minimal config', () => {
      const f = new Forest();
      const b = f.createBranch({ $value: 1, name: 'one' });
      expect(b.value).toBe(1);
    });
  });
});
