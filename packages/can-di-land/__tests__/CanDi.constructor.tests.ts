import { CanDI } from '../lib'

describe('CanDI', () => {
  describe('constructor', () => {
    it('operates without arguments', () => {
      const can = new CanDI;
      expect(can.has('foo')).toBeFalsy();
    });

    describe('type: value', () => {
      it('accepts value types', () => {
        const can = new CanDI([
          { name: 'foo', value: '1' },
          { name: 'bar', value: '2' }
        ]);

        expect(can.has('foo')).toBeTruthy();
      });

      describe('async', () => {
        it('is not present until it is resolved',
          async () => {
            const pending = Promise.resolve(1);
            const can = new CanDI([
              { name: 'foo', value: pending, config: { async: true, type: 'value' } },
              { name: 'bar', value: '2' }
            ]);

            expect(can.has('foo')).toBeFalsy();
            await pending;
            expect(can.has('foo')).toBeTruthy();
          });
      });

      describe('async final', () => {
        it('is not present until it is resolved',
          async () => {
            const pending = Promise.resolve(1);
            const can = new CanDI([
              { name: 'asyncFinalVar', value: pending, config: { final: true, async: true, type: 'value' } },
              { name: 'bar', value: '2' }
            ]);

            expect(can.has('asyncFinalVar')).toBeFalsy();
            await pending;
            expect(can.has('asyncFinalVar')).toBeTruthy();
          });

        it('cannot be redefined', async () => {
          const pending = Promise.resolve(1);
          const can = new CanDI([
            { name: 'asyncFinalVar', value: pending, config: { final: true, async: true, type: 'value' } },
            { name: 'bar', value: '2' }
          ]);

          // cannot be defined _before_ its value is present
          expect(() => {
            can.set('asyncFinalVar', 20);
          }).toThrow();

          // cannot be defined _after_ its value is present
          await pending;
          expect(() => {
            can.set('asyncFinalVar', 20);
          }).toThrow();
        });
      });

      describe('final', () => {
        it('is immediately present', () => {
          const can = new CanDI([
            { name: 'finalVar', value: 100, config: { final: true, type: 'value' } },
            { name: 'bar', value: '2' }
          ]);
          expect(can.has('finalVar')).toBeTruthy();
        });

        it('cannot be redefined', () => {
          const can = new CanDI([
            { name: 'finalVar', value: 100, config: { final: true, type: 'value' } },
            { name: 'bar', value: '2' }
          ]);
          expect(() => {
            can.set('bar', 20);
          }).not.toThrow();
          expect(() => {
            can.set('finalVar', 2);
          }).toThrow();
        });
      });
    });

  });
});
