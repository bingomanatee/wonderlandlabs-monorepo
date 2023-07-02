import { CanDI } from '../lib'

describe.skip('CanDI', () => {
  describe('config', () => {
    it('provided value type if omitted', () => {
      const can = new CanDI();

      can.set('foo', 100);
      expect(can.registry.get('foo')!.config.type).toBe('value');
      can.set('bar', { type: 'value' });
      expect(can.registry.get('bar')!.config.type).toBe('value');
    });

    it('sets he type if passed as string', () => {
      const can = new CanDI();
      can.set('foo', 100, 'value');
      expect(can.registry.get('foo')!.config.type).toBe('value');

      can.set('bar', () => 400, 'comp');
      expect(can.registry.get('bar')!.config.type).toBe('comp');

      can.set('vey', () => 400, 'func');
      expect(can.registry.get('vey')!.config.type).toBe('func');
    })
  });

  describe('computeOnce and final', () => {
    it('respects configuration on chaining and complex dependendencies', () => {
      const can = new CanDI();

      function makePoint(x: number, y: number) {
        return ({ x, y });
      };

      function pointArray(x: number, y: number) {
        return [x, y];
      }

      const Once2d = '2dPointComputeOnce';

      can.set('2dPoint', makePoint, { type: 'comp', deps: ['x', 'y'] });
      can.set('2dPointFinal', makePoint, { type: 'comp', deps: ['x', 'y'], final: true });
      can.set(Once2d, makePoint, { type: 'comp', deps: ['x', 'y'], computeOnce: true });
      const item = can.registry.get(Once2d)!;

      can.set('x', 100);
      can.set('y', 200, { type: 'value' });

      console.log('config registry:', can.registry);
      expect(can.value('2dPoint')).toEqual({ x: 100, y: 200 });
      expect(can.value('2dPointFinal')).toEqual({ x: 100, y: 200 });
      expect(can.value(Once2d)).toEqual({ x: 100, y: 200 });

      can.set('x', 400);
      expect(can.value('2dPoint')).toEqual({ x: 400, y: 200 });
      expect(can.value('2dPointFinal')).toEqual({ x: 400, y: 200 }); // note the OUTPUT changes -- but not the resource definition.
      expect(can.value('2dPointComputeOnce')).toEqual({ x: 100, y: 200 });

      can.set('2dPoint', pointArray);
      expect(() => {
        can.set('2dPointFinal', pointArray);
      }).toThrow();
      can.set(Once2d, pointArray);

      can.set('y', 1000)
      expect(can.value('2dPoint')).toEqual([400, 1000]); // both the resource and the computed value change
      expect(can.value('2dPointFinal')).toEqual({ x: 400, y: 1000 }); // the resource is still makePoint, but the output changes
      expect(can.value('2dPointComputeOnce')).toEqual({ x: 100, y: 200 }); // "computeOnce" is forever. The resource has changed but the value persists.

      can.set('x', -100);
      expect(can.value('2dPoint')).toEqual([-100, 1000]); // both the resource and the computed value change
      expect(can.value('2dPointFinal')).toEqual({ x: -100, y: 1000 }); // the resource is still makePoint, but the output changes
      expect(can.value('2dPointComputeOnce')).toEqual({ x: 100, y: 200 }); // "computeOnce" is forever. The resource has changed but the value persists.
    });

    describe('bind', () => {
      it('binds and meta-s an entry', () => {
        const can = new CanDI([
          {
            name: 'meta',
            value: () => (function () {
              //@ts-ignore
              (this as CanDI).set('foo', 'bar')
            }),
            config: {
              type: 'comp',
              bind: true,
              meta: true
            }
          }
        ])
        expect(can.value('foo')).toBe('bar')
      });
    });
  });
});
