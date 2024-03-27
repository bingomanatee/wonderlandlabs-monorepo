import Forest from './../../lib/Forest';
import { TypeEnum } from '@wonderlandlabs/walrus';
import { isLeafIF } from '../types';

describe('forest', () => {
  describe('Forest', () => {
    describe('Leaf', () => {
      it('should define leaves for controlled fields', () => {
        const f = new Forest();

        const br = f.createBranch({
          name: 'point',
          $value: { x: 0, y: 0, z: 0 },
          leaves: {
            x: { type: TypeEnum.number, strict: false },
            y: { type: TypeEnum.number, strict: false },
          },
        });

        expect(isLeafIF(br.leaves?.get('x'))).toBeTruthy();
        expect(isLeafIF(br.leaves?.get('y'))).toBeTruthy();
        expect(isLeafIF(br.leaves?.get('z'))).toBeFalsy();
      });
    });
  });
});
