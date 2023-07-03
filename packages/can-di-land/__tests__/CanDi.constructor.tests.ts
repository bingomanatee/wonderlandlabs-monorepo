import { CanDI } from '../lib';
import { ResDef } from '../src/types'
import { ResourceKey } from '../lib/types'

// a decorator factory for CanDI tests;
// accepts the initial param for the can,
// then injects it as the subject.

function subject(initParams: ResDef[],
                 test: (can: CanDI) => Promise<any> | void)
  : () => void {
  const can = new CanDI(initParams);
  return () => test(can)
}

// we are abstracting the body of some of these tests
// to prevent duplication as they are reused in both varieties of computeOnce
function notPresentUntilResolved(key: ResourceKey, pending: Promise<any>) {
  return async (can: CanDI) => {
    expect(can.has(key)).toBeFalsy();
    await pending;
    expect(can.has(key)).toBeTruthy();
  }
}

function isPresent(name: ResourceKey, value, type, otherConfigs = {}) {
  return subject([{name, value, config: {type, ...otherConfigs, final: true}}],
    (can) => {
      expect(can.has(name)).toBeTruthy();
    })
}

function finalTest(key: ResourceKey, value: any, isAsync: boolean)  {
  return subject([
    { name:key, value, config: { final: true, async: isAsync, type: 'value' } },
  ], async (can) => {
    // cannot be defined _before_ its value is present
    expect(() => {
      can.set(key, 20);
    }).toThrow();
    if (!isAsync) return;
    // cannot be defined _after_ its value is present
    await value;
    expect(() => {
      can.set(key, 20);
    }).toThrow();
  });
}

describe('CanDI', () => {
  describe('constructor', () => {
    it('operates without arguments', () => {
      const can = new CanDI;
      expect(can.has('foo')).toBeFalsy();
    });

    describe('type: value', () => {
      it('accepts value types', subject([
        { name: 'foo', value: '1' }, // implicit type
        { name: 'bar', value: '2', type: 'value' },
        { name: 'vey', value: '3', config: { type: 'value' } }
      ], (can) => {
        expect(can.has('foo')).toBeTruthy();
        expect(can.typeof('foo')).toEqual('value');
        expect(can.typeof('bar')).toEqual('value');
        expect(can.typeof('vey')).toEqual('value');
      }));

      describe('async', () => {
        it('is not present until it is resolved', async () => {
          const pending = new Promise((done) => done(100));
          return subject(
            [{ name: 'asyncKey', value: pending, config: { type: 'value', async: true } }],
            notPresentUntilResolved('asyncKey', pending)
          )();
        });

        describe('async final', () => {
          it('is not present until it is resolved', // identical to the above test - but async this time
            async () => {
              const pending = new Promise((done) => done(100));
              return subject(
                [{ name: 'asyncKey', value: pending, config: { type: 'value', async: true, final: true } }],
                notPresentUntilResolved('asyncKey', pending)
              )();
            });

          it('cannot be redefined', async () => {
            const pending = Promise.resolve(1);
            return (finalTest('asyncFinalVar', pending, true))()
          });
        });

        describe('final', () => {
          it('is immediately present',
            isPresent('foo',  100, 'value', {})
          );

          it('cannot be redefined', async () => {
            const pending = Promise.resolve(1);
            return (finalTest('finalVar', 30, false))()
          });
        });

        describe('computeOnce', () => {
          // this flag doesn't affect tests
        })
      });
    });
  });
});
