import { delay, subject } from '../testUtils'

describe.skip('CanDI', () => {
  describe('dynamic', () => {
    describe('value', () => {
      it('provides a basic value', subject([], (can) => {
        expect(can.has('basicVal')).toBeFalsy();
        can.add('basicVal', 100);
        expect(can.has('basicVal')).toBeTruthy();
      }));

      it('provides an async value', subject([], async (can) => {
        const promise = delay('latent', 200);
        can.add('asyncVal', promise, { async: true, type: 'value' });
        expect(can.has('asyncVal')).toBeFalsy();
        await (promise);
        expect(can.has('asyncVal')).toBeTruthy();
        expect(can.get('asyncVal')).toBe('latent')
      }));

      it('constrains final value', subject([], (can) => {
        can.add('finalValue', 1000, { type: 'value', final: true });
        expect(can.has('finalValue')).toBeTruthy();
        expect(can.get('finalValue')).toBe(1000);
        expect(() => can.add('finalValue', 200)).toThrow();
        expect(can.get('finalValue')).toBe(1000);
      }));

      it('throws when dependencies are specified', subject([], (can) => {
          expect(() => can.add('codependent', 3000, { type: 'value', deps: ['something'] })).toThrow();
        })
      );
    });

    describe('comp', () => {
      it('should return a value without deps', subject([],
        (can) => {
          can.add('basicComp', () => Math.PI, 'comp');
          expect(can.get('basicComp')).toBe(Math.PI);
        }))
    });

    it('should delay execution of a comp with deps', subject([],
      (can) => {
        can.add('a+b', (a: number, b: number) => a + b, { type: 'comp', deps: ['a', 'b'] });
        expect(can.has('a+b')).toBeFalsy();
        can.add('a', 100);
        expect(can.has('a+b')).toBeFalsy();
        can.add('b', -200);

        expect(can.has('a+b')).toBeTruthy();
        expect(can.get('a+b')).toBe(-100);
      }
    ));

    it('updates when dependencies change', subject([],
      (can) => {
        can.add('a+b', (a: number, b: number) => a + b, { type: 'comp', deps: ['a', 'b'] });
        can.add('a', 100);
        can.add('b', -200);
        expect(can.get('a+b')).toBe(-100);
        can.add('a', 300);
        expect(can.get('a+b')).toBe(100);
        can.add('b', -1000);
        expect(can.get('a+b')).toBe(-700);
      }
    ));

    it('allows deep dependencies', subject([],
      (can) => {
        can.add('top-x', 10);
        can.add('top-y', 0);
        can.add('top', function(x: number, y: number){ return {x, y}},
          {type: 'comp', deps: ['top-x', 'top-y']});

        can.add('bottom-x', 50);
        can.add('bottom-y', 90);
        can.add('bottom', function(x: number, y: number){ return {x, y}},
          {type: 'comp', deps: ['bottom-x', 'bottom-y']});

        can.add('volume', (top: any, bottom: any) => {
          const xDif = Math.abs(top.x - bottom.x) ;
          const yDif = Math.abs(top.y - bottom.y);
          console.log('volume:', xDif, yDif);
          return xDif * yDif;
        }, {type: 'comp', deps: ['top', 'bottom']});

        expect(can.get('volume')).toBe(40 * 90);

        can.add('top-y', 100);
        console.log(can.values.value);

        expect(can.get('volume')).toBe( 40 * 10);
      }
    ));
  })
})
