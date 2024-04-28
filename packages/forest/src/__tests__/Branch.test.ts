import { Forest } from '../../lib';
import { BranchIF } from '../../lib/types';
import { TypedBranchIF } from '../types';

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

      it('should reflect test constraints', () => {
        const f = new Forest();
        const b = f.createBranch({
          $value: [ 1, 2, 3 ],
          name: 'numbers',
          test(value) {
            if (Array.isArray(value)) {
              value.forEach((n, i: number) => {
                if (typeof n !== 'number') {
                  throw new Error('value ' + i + ' is not a number.');
                }
                if (n < 0) {
                  throw new Error(`value ${i} (${n}) must be >= 0`);
                }
              });
            } else {
              throw new Error('cannot accept non-array values');
            }
          },
        });
        expect(b.value).toEqual([ 1, 2, 3 ]);

        b.value = [ 4, 5, 6 ];
        expect(b.value).toEqual([ 4, 5, 6 ]);

        expect(() => (b.value = [ 4, 5, 'six' ])).toThrowError(
          'value 2 is not a number.'
        );

        expect(b.value).toEqual([ 4, 5, 6 ]);

        b.value = [ 7, 8, 9 ];

        expect(b.value).toEqual([ 7, 8, 9 ]);

        expect(() => {
          b.value = [ 1, -1, 0 ];
        }).toThrowError('value 1 (-1) must be >= 0');

        expect(b.value).toEqual([ 7, 8, 9 ]);
      });
    });

    describe('actions', () => {
      it('executes actions', () => {
        const f = new Forest();

        type PointValue = {
          x: number;
          y: number;
        };

        const pt = f.createBranch({
          name: 'point',
          $value: {
            x: 0,
            y: 0,
          },
          actions: {
            offset(s: BranchIF, x, y) {
              const typedS = s as TypedBranchIF<PointValue>;
              const newX: number = typedS.value.x + (x as number);
              const newY: number = typedS.value.y + (y as number);
              typedS.set('x', newX);
              typedS.set('y', newY);
            },
          },
        }) as TypedBranchIF<PointValue>;

        pt.do.offset(1, 2);
        expect(pt.value).toEqual({ x: 1, y: 2 });
        pt.do.offset(5, 5);
        expect(pt.value).toEqual({ x: 6, y: 7 });
      });
    });
    
    // describe('transactional insulation', () => {});
  });
});
