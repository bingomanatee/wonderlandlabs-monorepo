import { expect, it, describe } from 'vitest';
import { Collection, Forest } from '../../../src';
import fs from 'fs';
import type { CollectionIF } from '../../../src/types/types.collections';

describe('Collection', () => {
  it('allows update', () => {
    const f = new Forest();

    const c = new Collection('incdec', { actions: {}, initial: 1 }, f);

    expect(c.value).toBe(1);

    const incrementor = (n) => n + 1;

    c.update(incrementor);
    c.update(incrementor);

    expect(c.value).toBe(3);
  });
  it('allows revision', () => {
    const f = new Forest();

    const c = new Collection<number>(
      'incdec',
      {
        actions: {},
        initial: 1,
        revisions: {
          inc: (value) => value + 1,
          dec: (value) => value - 1,
        },
      },
      f
    );

    expect(c.value).toBe(1);

    c.revise('inc');
    c.revise('inc');

    expect(c.value).toBe(3);

    c.revise('dec');

    expect(c.value).toBe(2);
  });

  it('allows SuperClass to be extended', () => {
    class SuperClass extends Collection<number, SuperClass> {
      constructor() {
        super(
          'superClass!',
          {
            initial: 1,

            actions: {
              increment(coll) {
                expect(coll.increment).toBeTypeOf('function');
                coll.mutate(({ value }) => value + 1, 'increment');
              },
            },
          },
          new Forest()
        );
      }

      increment() {
        this.act('increment');
      }
    }

    const sc = new SuperClass();

    expect(sc.value).toBe(1);
    sc.increment();
    expect(sc.value).toBe(2);
  });

  it.skip('allows superClass file to be written', () => {
    const coll = new Collection(
      'superClass!',
      // --- start copy here <<<
      {
        initial: 1,

        actions: {
          increment(coll) {
            coll.mutate(({ value }) => value + 1, 'increment');
          },
        },
      }, // >>> end copy here
      new Forest()
    );

    if (fs.existsSync(TMP_DIR + FILE_NAME)) {
      fs.unlinkSync(TMP_DIR + FILE_NAME);
    }

    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR);
    }

    const def = coll.superClassMe('SuperClass', 'number');

    const myCode = fs.readFileSync(__filename).toString();
    const RE = new RegExp(`<<${''}<(.*)>>${''}>`);

    const matches = myCode.replace(/\n/g, '').match(RE);
    const params = matches[1].trim().replace(', //', '');
    const augmentedDef = def.replace('{/** insert base collection params here */}', params);

    fs.writeFileSync(TMP_DIR + FILE_NAME, augmentedDef);
  });

  it ('has a typed .do property', () => {
    const f = new Forest();

    const actions = {
      increment(coll: CollectionIF<number>) {
        coll.next(coll.value + 1);
      },
      add(coll: CollectionIF<number>, summer: number): number {
        return coll.value + summer;
      }
    };

    const c = new Collection<number>('num', {
      actions,
      initial: 0 }, f);

    const foo = c.do.add
    expect(c.value).toBe(3);
  });

  it.skip('keyof test', () => {


    // ActsDo extracts the first parameter type and sets it as the return type
    type ActsDo<Acts> = {
      [K in keyof Acts]: Acts[K] extends (param1: infer ParamType, args: any[]) => any
        ? (param: ParamType) => ParamType
        : never;
    };

    // Interface for Foo that contains the mapped acts
    interface FooIF<Acts> {
      acts: ActsDo<Acts>;
    }

    function makeFoo<Acts>(inputActs: Acts)
      : FooIF<Acts> {
      return {
        acts: Object.keys(inputActs).reduce((out, key) => {
          return { ...out, [key]: (param) => param };
        }, {} as any)
      };
    }


    const args = { alpha: (a: number) => a * 2, beta: (s: string) => `${s} 3` };

    const n = makeFoo(args);
    const m = n.acts.alpha(4);
    const q = n.acts.beta('foo');
    expect(m).toBeTypeOf('string');

    class Foo<Acts> {

      private _acts?: ActsDo<Acts>;
      public get acts(): ActsDo<Acts> {
        if (!this._acts) {
          this._acts = Object.keys(this.actsBase).reduce((out, key) => {
            return {
              ...out,
              [key]: (param) => param,
            };
          }, {} as any) as ActsDo<typeof this.actsBase>;
        }

        return this._acts;
      }

      constructor(private actsBase: Acts) {
      }
    }
    const myFoo = new Foo(args);

    const outAlpha = myFoo.acts.alpha(3);
    const putBeta = myFoo.acts.beta('foo');
  });
});

const TMP_DIR = __dirname + '/tmp';
const FILE_NAME = '/SuperClass.ts';
