import { expect, it, describe } from 'vitest';
import { Collection, Forest } from '../../../src';
import fs from 'fs';

describe('Collection', () => {
  it('allows update', () => {
    const f = new Forest();

    const c = new Collection('incdec', { initial: 1, actions: {} }, f);

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
    class SuperClass extends Collection<number> {
      constructor() {
        super(
          'superClass!',
          {
            initial: 1,

            actions: {
              increment(coll) {
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
});

const TMP_DIR = __dirname + '/tmp';
const FILE_NAME = '/SuperClass.ts';
