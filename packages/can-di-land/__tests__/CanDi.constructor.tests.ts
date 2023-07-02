import { CanDI } from '../lib';
import {
  entry_value,
  async_value_is_eventually_present,
  subject,
  entry__exists, summerFn, summerFnAsync, delay, cannot_redefine_async
} from '../testUtils'

/**
 * we abstract reused tests into the utils library to prevent redundant code.
 */

// a decorator factory for CanDI tests;
// accepts the initial param for the can,
// then injects it as the subject.

describe('CanDI', () => {
  describe('constructor', () => {
    it('operates without arguments', () => {
      const can = new CanDI;
      expect(can.has('foo')).toBeFalsy();
    });

    describe('type: value', () => {
      /** there are many ways to define/ config for constructor items:
       * 1) without any config; defaults to a "vanilla" value entity
       * 2) with a type but no more specific configuration
       * 3) with an explicit configuration defines type.
       */
      it('accepts value types', subject([
        { key: 'foo', value: '1' }, // implicit type
        { key: 'bar', value: '2', type: 'value' },
        { key: 'vey', value: '3', config: { type: 'value' } }
      ], (can) => {
        expect(can.has('foo')).toBeTruthy();
        expect(can.has('bar')).toBeTruthy();
        expect(can.has('vey')).toBeTruthy();
        expect(can.entry('foo')?.type).toEqual('value');
        expect(can.entry('bar')?.type).toEqual('value');
        expect(can.entry('vey')?.type).toEqual('value');
      }));

      describe('async value', () => {
        it('is not present until it is resolved', async () => {
          const pending = new Promise((done) => done(100));
          return subject(
            [{ key: 'asyncComputeOnce', value: pending, config: { type: 'value', async: true } }],
            async_value_is_eventually_present('asyncComputeOnce', pending),
            'value -- async -- not present until resolved'
          )();
        });
      });

      describe('async final value', () => {
        it('is not present until it is resolved', // identical to the above test - but async this time
          ((pending) => subject(
              [
                {
                  key: 'asyncFinalComputeOnce', value: pending,
                  config: { type: 'value', async: true, final: true }
                }
              ],
              async_value_is_eventually_present('asyncFinalComputeOnce', pending),
              'async - final - value'
            )
          )(delay(100, 300))
        )

        it('cannot be redefined',
          async () => {
            const promise = delay(200, 100);
            const can = new CanDI([{
              key: 'asyncFinalValue',
              value: promise,
              config: { type: 'value', async: true, final: true }
            }]);
            // cannot redefine value BEFORE it resolves...
            expect(() => can.set('asyncFinalValue', 100)).toThrow();
            await promise;
            // ... or after
            expect(() => can.set('asyncFinalValue', 100)).toThrow();
          });
      });

      describe('final value', () => {
        it('is immediately present',
          subject([{ key: 'fooComputeOnce', value: 100, config: { type: 'value', final: true } }],
            entry_value('fooComputeOnce', 100),
            'final is present')
        );

        it('cannot be redefined',
          subject([{
            key: 'finalValue',
            value: 200,
            config: { type: 'value', async: true, final: true }
          }], (can) => {
            expect(() => can.set('finalValue', 300)).toThrow();
          }));
      });
    });

    describe('type: func', () => {
      /** there are two ways to define config for constructor items:
       * 1) with a type but no more specific configuration
       * 2) with an explicit configuration defines type.
       *
       * (the "default" type will never be func.)
       */
      it('accepts func type without config', subject([
            { key: 'bar', value: () => 2, type: 'func' },
          ],
          entry__exists('bar', 'func')
        )
      );
      it('accepts func type with config', subject([
            { key: 'bar', value: () => 2, config: { type: 'func' } },
          ],
          entry__exists('bar', 'func')
        )
      );

      it('returns a function', subject(
        [{
          key: 'funcProp', value: async function () {
            return 100
          }, config: { type: 'func' }
        }],
        (can) => expect(typeof can.get('funcProp')).toBe('function')
      ));

      it('produces a function that takes props and returns a value', subject([
        {
          key: 'summer',
          value: summerFn,
          type: 'func'
        }
      ], (can) => {
        expect(can.get('summer')(1, 2)).toBe(3);
      }));


      it('produces a function includes arguments and a value', subject([
        {
          key: 'summer',
          value: summerFn,
          config: {
            type: 'func',
            args: [100, 200]
          }
        }
      ], (can) => {
        expect(can.get('summer')(1, 2)).toBe(303);
      }));

      describe('async', () => {
        it('is immediately present', subject(
          [{
            key: 'asyncFunc', value: async function () {
              return await 100
            }, config: { type: 'func', async: true }
          }],
          entry__exists('asyncFunc', 'func')
        ));

        it('returns a function', subject(
          [{
            key: 'asyncFunc', value: async function () {
              return await 100
            }, config: { type: 'func', async: true }
          }],
          (can) => expect(typeof can.get('asyncFunc')).toBe('function')
        ));

        it('produces a function that takes props and returns an async value', subject([
          {
            key: 'summerAsync',
            value: summerFnAsync,
            config: {
              type: 'func',
              async: true
            }
          }
        ], async (can) => {
          const result = can.get('summerAsync')(1, 2);
          expect(typeof (result.then)).toBe('function');
          const value = await result;
          expect(value).toBe(3);
        }));


        it('produces a function includes arguments and a value',

          () => {
            const can = new CanDI([
              {
                key: 'summerAsync',
                value: summerFnAsync,
                config: {
                  type: 'func',
                  args: [100, 200]
                }
              }
            ]);

            const fn = can.get('summerAsync');
            expect(typeof (fn)).toBe('function');
            // (1, 2);
            // expect(typeof (result.then)).toBe('function');
            // const value = await result;
            // expect(value).toBe(303);
          })
      });
    });

    describe('type: comp', () => {
      /** there are two ways to define config for constructor items:
       * 1) with a type but no more specific configuration
       * 2) with an explicit configuration defines type.
       *
       * (the "default" type will never be func.)
       */
      it('accepts comp type without config', subject([
            { key: 'bar', value: () => 2, type: 'comp' },
          ],
          entry__exists('bar', 'comp')
        )
      );
      it('accepts comp type with config', subject([
            { key: 'bar', value: () => 2, config: { type: 'comp' } },
          ],
          entry__exists('bar', 'comp')
        )
      );
    });

    it('returns a value',
      subject([{ key: 'syncComp', value: () => 2, type: 'comp' }], entry_value('syncComp', 2))
    );

    it('includes arguments',
      subject([{
        key: 'syncComp', value: (a: number, b: number) => a + b, config: {
          type: 'comp', args: [1, 3]
        }
      }], entry_value('syncComp', 4))
    );

    describe('async', () => {
      it('eventually returns a value',
        async () => {
          const can = new CanDI([{
              key: 'asyncComp', value: () => delay(2, 100), config: {
                type: 'comp',
                async: true
              }
            }]
          )

          expect(can.has('asyncComp')).toBeFalsy();
          await (delay(null, 250));
          expect(can.has('asyncComp')).toBeTruthy();
          expect(can.get('asyncComp')).toBe(2);
        }
      );

      it('includes arguments',
        async () => {
          const can = new CanDI(
            [{
              key: 'asyncCompArg', value: (a: number, b: number) => delay(a + b, 100), config: {
                type: 'comp', args: [1, 3], async: true
              }
            }]
          )
          expect(can.has('asyncCompArg')).toBeFalsy();
          await (delay(null, 250));
          expect(can.has('asyncCompArg')).toBeTruthy();
          expect(can.get('asyncCompArg')).toBe(4);
        });
    });
  });
});
