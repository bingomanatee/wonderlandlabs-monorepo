import { delay, subject } from '../testUtils'
import { CanDI } from '../lib'

describe('CanDI', () => {
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

      it.skip('throws when value dependencies are specified', () => {
        const can = new CanDI();
        expect(() => can.add('codependent', 3000, { type: 'value', deps: ['something'] })).toThrow();
      })
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
        can.set('a', 300);
        expect(can.get('a+b')).toBe(100);
        can.set('b', -1000);
        expect(can.get('a+b')).toBe(-700);
      }
    ));

    it('allows deep dependencies', subject([],
      (can) => {
        can.add('top-x', 10);
        can.add('top-y', 0);
        can.add('top', function (x: number, y: number) {
            return { x, y }
          },
          { type: 'comp', deps: ['top-x', 'top-y'] });

        can.add('bottom-x', 50);
        can.add('bottom-y', 90);
        can.add('bottom', function (x: number, y: number) {
            return { x, y }
          },
          { type: 'comp', deps: ['bottom-x', 'bottom-y'] });

        can.add('volume', (top: any, bottom: any) => {
          const xDif = Math.abs(top.x - bottom.x);
          const yDif = Math.abs(top.y - bottom.y);
          return xDif * yDif;
        }, { type: 'comp', deps: ['top', 'bottom'] });

        expect(can.get('volume')).toBe(40 * 90);

        can.set('top-y', 100);

        expect(can.get('volume')).toBe(40 * 10);
      }
    ));

    it.skip('errors on infinite loops', async () => {
      // THIS SHOULD WORK but the compoiler doesn't like this for some reason.
      const can = new CanDI();
      can.events.subscribe((event) => console.log('loop event:', event.type, event.value));
      can.add('a-loop', 100);
      can.add('b-loop', (a: number, c: number) => a + c, { type: 'comp', deps: ['a-loop', 'c-loop'] });
      try {
        console.log('c-loop adding....');
        await expect(() => {
          can.add('c-loop', (a: number, b: number) => a + b, { type: 'comp', deps: ['a-loop', 'b-loop'] });
        }).toThrow();
        console.log('....c-loop added');
      } catch (err) {
        if (err instanceof Error) {
          console.log('dep error:', err.message);
        }
      }
    })
  })

  describe('getAsync', () => {
    it('should return values', async () => {
      const can = new CanDI([
        { key: 'watchedValue', type: 'value', value: 300 }
      ])
      const v = await can.getAsync('watchedValue');
      expect(v).toBe(300);
    })

    it('should return async values', async () => {
      const can = new CanDI([
        {
          key: 'watchedValueAsync', value: delay(400, 100),
          config: {
            type: 'value',
            async: true
          }
        }
      ])
      const v = await can.getAsync('watchedValueAsync');
      expect(v).toBe(400);
    });

    it('should return computed values', async() => {
      const can = new CanDI([
        {
          key: 'watchedComp', value: () => 700,
          config: {
            type: 'comp',
          }
        }
      ])
      const v = await can.getAsync('watchedComp');
      expect(v).toBe(700);
    })


    it('should return computed values with deps', async() => {
      const can = new CanDI([
        {
          key: 'watchedCompDeps', value: (a: number, b: number) => a + b,
          config: {
            type: 'comp',
            deps: ['a', 'b']
          }
        }
      ])
      setTimeout(() => {
        can.add('a', 100);
        can.add('b', 333);
      })

      const v = await can.getAsync('watchedCompDeps');
      expect(v).toBe(433);
    });

    it('should return computed async values with deps', async() => {
      const can = new CanDI([
        {
          key: 'watchedCompDepsAsync', value: (a: number, b: number) => delay(a + b, 100),
          config: {
            type: 'comp',
            async: true,
            deps: ['a', 'b']
          }
        }
      ])
      setTimeout(() => {
        can.add('a', 200);
        can.add('b', 333);
      })

      const v = await can.getAsync('watchedCompDepsAsync');
      expect(v).toBe(533);
    });

    it('should return computed async values', async() => {
      const can = new CanDI([
        {
          key: 'watchedCompAsync', value: () => delay(900, 100),
          config: {
            type: 'comp',
            async: true
          }
        }
      ])
      const v = await can.getAsync('watchedCompAsync');
      expect(v).toBe(900);
    })
  })
})
