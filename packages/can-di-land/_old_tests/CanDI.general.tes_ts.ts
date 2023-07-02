import { CanDI } from '../lib'

describe.skip('CanDI', () => {
  describe('add', () => {
    describe('func', () => {
      it('adds a function', async () => {
        let can = new CanDI();
        const fn = (n: number) => 2 * n;
        await can.set('foo', fn, { type: 'func' });

        const result = await can.get('foo')
        expect(result(100)).toEqual(200);
      });

      it('allows dependencies into function', async () => {
        let can = new CanDI();
        const fn = (power: number, n: number) => n ** power;
        await can.set('foo', fn, { type: 'func', deps: ['power'] });
        await can.set('power', 4, { type: 'value' });

        const result = await can.get('foo');
        expect(result(100)).toEqual(100 ** 4);
      });
    });

    describe('value', () => {
      it('adds a constant', async () => {
        let can = new CanDI();

        await can.set('foo', 3, { type: 'value' });
        const result = await can.get('foo');
        expect(result).toEqual(3);
      })
    });

    describe('multiple adds', () => {
      it('should throw on second set', async () => {
        let can = new CanDI();

        await can.set('constant-field', 3, { type: 'value', final: true });
        await expect((async () => {
          await can.set('constant-field', 6);
        })()).rejects.toThrow();
        const result = await can.get('constant-field');
        expect(result).toEqual(3);
      });
      it('should allows a second set if rewritable', async () => {
        let can = new CanDI();

        await can.set('bar', 3, { type: 'value' });
        await can.set('bar', 6);
        const result = await can.get('bar');
        expect(result).toEqual(6);
      });
    });
  });

  describe('get', () => {
    it('gets a single resource', async () => {
      const can = new CanDI();

      await can.set('foo', 3, { type: 'value' });
      const result = await can.get('foo');
      expect(result).toEqual(3);
    });

    it('throws error if resource undefined', async () => {
      const can = new CanDI();

      // can.set('foo', 3, { type: 'value' });
      await expect((async () => {
        await can.get('foo');
      })()).rejects.toThrow();
    });

    it('throws error if resource defined too late', async () => {
      const can = new CanDI();

      setTimeout(() => {
        can.set('foo', 3, { type: 'value' });
      }, 200);
      await expect((async () => {
        await can.get('foo', 50);
      })()).rejects.toThrow();
    });

    it('gets a single resource, when defined after call', async () => {
      const can = new CanDI();

      setTimeout(() => {
        can.set('foo', 3, { type: 'value' });
      }, 50);
      const result = await can.get('foo', 100);
      expect(result).toEqual(3);
    });
    it('gets several resources', async () => {
      const can = new CanDI();

      await can.set('foo', 3, { type: 'value' });
      await can.set('bar', 100, { type: 'value' });
      await can.set('vey', -100, { type: 'value' });
      const result = await can.get(['foo', 'vey', 'bar']);

      expect(result).toEqual([3, -100, 100]);
    });

    it('throws when getting several resources if some are not defined', async () => {
      const can = new CanDI();

      await can.set('foo', 3, { type: 'value' });
      await can.set('vey', -100, { type: 'value' });

      await expect((() => can.get(['foo', 'vey', 'bar'], 100))()).rejects.toThrow();

    });

    it('throws when getting several resources if some are defined too late', async () => {
      const can = new CanDI();

      await can.set('foo', 3, { type: 'value' });
      await can.set('vey', -100, { type: 'value' });
      setTimeout(() => {
        can.set('bar', 3, { type: 'value' });
      }, 100);

      await expect((() => can.get(['foo', 'vey', 'bar'], 50))()).rejects.toThrow();

    });

    it('gets several resources, when defined after call', async () => {
      const can = new CanDI();

      await can.set('foo', 3, { type: 'value' });
      setTimeout(() => {
        can.set('bar', 100, { type: 'value' });
        can.set('vey', -100, { type: 'value' });
      }, 50)
      const result = await can.get(['foo', 'vey', 'bar'], 100);

      expect(result).toEqual([3, -100, 100]);
    });
  });

  describe('readme', () => {
    it('first doc', async () => {
      const can = new CanDI();
      can.set('foo', 100, { type: 'value' });
      can.get('sum-of-foo-and-vey').then((value) => {
        console.log('the sum is ', value)
      });
      can.set('sum-of-foo-and-vey', (foo: number, vey: number) => {
        return foo + vey
      }, { type: 'comp', deps: ['foo', 'vey'] })
      can.set('vey', -20, { type: 'value' });
      can.set('vey', 300);
      setTimeout(() => {
        can.set('foo', 200);
      }, 50)
      await new Promise((done) => setTimeout(done, 100));
      can.get('sum-of-foo-and-vey').then((value) => console.log('after 100 ms, the sum is ', value))
    });

    it('meta example', () => {

      const point = { x: 100, y: 200 }

      const can = new CanDI([
        {
          name: 'meta',
          value: () => (function () {
            //@ts-ignore
            return Math.round(Math.sqrt(this.x ** 2 + this.y ** 2))
          }.bind(point)),
          config: {
            type: 'comp',
            meta: true,
            computeOnce: true
          }
        }
      ]);

      expect(can.value('meta')).toEqual(224)
    })
  });

  describe('currying', () => {
    function point3(x: number, y: number, z: number) {
      return ({ x, y, z });
    }

    it('uses the parameters when called', () => {
      const can = new CanDI();
      can.set('point', point3, 'func');
      expect(can.value('point')!(1, 2, 3)).toEqual({ x: 1, y: 2, z: 3 })
    });

    it('accepts an arg preset from config', () => {
      const can = new CanDI();
      can.set('pointA', point3, { type: 'func', args: [100] });
      expect(can.value('pointA')!(1, 2, 3)).toEqual({ x: 100, y: 1, z: 2 })
    })


    it('accepts an arg preset from config', () => {
      const can = new CanDI();
      can.set('pointPA', point3, { type: 'func', deps: ['x'], args: [100] });
      can.set('x', 200);
      expect(can.value('pointPA')!(1, 2, 3)).toEqual({ x: 200, y: 100, z: 1 })
    })

  })
});
