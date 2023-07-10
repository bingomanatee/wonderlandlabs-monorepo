import { delay, subject } from '../testUtils'


describe('CanDI', () => {
  describe('dynamic', () => {
    describe('value', () => {
      it('provides a basic value', subject([], (can) => {
        expect(can.has('basicVal')).toBeFalsy();
        can.set('basicVal', 100);
        expect(can.has('basicVal')).toBeTruthy();
      }));

      it('provides an async value', subject([], async (can) => {
        const promise = delay('latent', 200);
        can.set('asyncVal', promise, { async: true, type: 'value' });
        expect(can.has('asyncVal')).toBeFalsy();
        await (promise);
        expect(can.has('asyncVal')).toBeTruthy();
        expect(can.value('asyncVal')).toBe('latent')
      }));

      it('constrains final value', subject([], (can) => {
        can.set('finalValue', 1000, { type: 'value', final: true });
        expect(can.has('finalValue')).toBeTruthy();
        expect(can.value('finalValue')).toBe(1000);
        expect(() => can.set('finalValue', 200)).toThrow();
        expect(can.value('finalValue')).toBe(1000);
      }));

      it('throws when dependencies are specified', subject([], (can) => {
          expect(() => can.set('codependent', 3000, { type: 'value', deps: ['something'] })).toThrow();
        })
      );
    });

    describe('comp', () => {
      it('should return a value without deps', subject([],
        (can) => {
          can.set('basicComp', () => Math.PI, 'comp');
          expect(can.value('basicComp')).toBe(Math.PI);
        }))
    });

    it('should delay execution of a comp with deps', subject([],
      (can) => {
        can.set('a+b', (a: number, b: number) => a + b, { type: 'comp', deps: ['a', 'b'] });
        expect(can.has('a+b')).toBeFalsy();
        can.set('a', 100);
        expect(can.has('a+b')).toBeFalsy();
        can.set('b', -200);

        expect(can.has('a+b')).toBeTruthy();
        expect(can.value('a+b')).toBe(-100);
      }
    ));

    it('updates when dependencies change', subject([],
      (can) => {
        can.set('a+b', (a: number, b: number) => a + b, { type: 'comp', deps: ['a', 'b'] });
        can.set('a', 100);
        can.set('b', -200);
        expect(can.value('a+b')).toBe(-100);
        can.set('a', 300);
        expect(can.value('a+b')).toBe(100);
        can.set('b', -1000);
        expect(can.value('a+b')).toBe(-700);
      }
    ));

    it('allows deep dependencies', subject([],
      (can) => {
        can.set('top-x', 10);
        can.set('top-y', 0);
        can.set('top', function(x: number, y: number){ return {x, y}},
          {type: 'comp', deps: ['top-x', 'top-y']});

        can.set('bottom-x', 50);
        can.set('bottom-y', 90);
        can.set('bottom', function(x: number, y: number){ return {x, y}},
          {type: 'comp', deps: ['bottom-x', 'bottom-y']});

        can.set('volume', (top: any, bottom: any) => {
          const xDif = Math.abs(top.x - bottom.x) ;
          const yDif = Math.abs(top.y - bottom.y);
          console.log('volume:', xDif, yDif);
          return xDif * yDif;
        }, {type: 'comp', deps: ['top', 'bottom']});

        expect(can.value('volume')).toBe(40 * 90);

        can.set('top-y', 100);
        console.log(can.values.value);

        expect(can.value('volume')).toBe( 40 * 10);
      }
    ));
  })
})
