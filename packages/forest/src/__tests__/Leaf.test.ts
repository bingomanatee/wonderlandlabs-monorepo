import Forest from './../../lib/Forest';
import { TypeEnum } from '@wonderlandlabs/walrus';

import { isLeafIF } from '../helpers';

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

      it('should allow bad values in non-strict leaves', () => {
        const f = new Forest();

        const br = f.createBranch({
          name: 'point',
          $value: { x: 0, y: 0, z: 0 },
          leaves: {
            x: { type: TypeEnum.number, strict: false },
            y: { type: TypeEnum.number, strict: false },
          },
        });

        br.set('x', 'foo');
        expect(br.value).toEqual({
          x: 'foo',
          y: 0,
          z: 0,
        }); // allows a value to be set against type if strict === false;
      });
      it('should not allow bad values in strict leaves', () => {
        const f = new Forest();

        const br = f.createBranch({
          name: 'point',
          $value: { x: 0, y: 0, z: 0 },
          leaves: {
            x: { type: TypeEnum.number, strict: true },
            y: { type: TypeEnum.number, strict: true },
          },
        });

        br.subscribe((v) => console.log('>>> point observable is now ', v));

        expect(() => {
          br.set('x', 'foo');
        }).toThrow();

        expect(br.value).toEqual({
          x: 0,
          y: 0,
          z: 0,
        });
      });

      describe('.value', () => {
        function makePoint() {
          const f = new Forest();

          const pt = f.createBranch({
            name: 'pt',
            $value: {
              x: 0,
              y: 0,
            },
            leaves: {
              x: { $value: 0 },
              y: { $value: 0 },
            },
          });
          return pt;
        }

        it("should let you get a branches' value from its leaves", () => {
          const pt = makePoint();

          pt.value = { x: 2, y: 3 };
          expect((pt.value as Record<string, number>).x).toBe(2);
        });

        it("should let you set branches values by setting a leaf's value", () => {
          const pt = makePoint();

          pt.leaves!.get('x')!.value = 1;
          expect((pt.value as Record<string, number>).x).toBe(1);
        });
      });
    });
  });
});
