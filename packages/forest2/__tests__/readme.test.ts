import { Forest } from "../src/Forest";
import { Collection } from "../src/collections/Collection";
import { expect, it, describe } from "@jest/globals";
import type { MutationValueProviderParams, ValueProviderParams } from "../src/types/types.shared";
import type { CollectionAction } from "../src/types/type.collection";

function message(...items: any[]) {
  if (false) console.log(...items);
}

function makeCounter(initial = 0, name = "counter") {
  const f = new Forest();

  return new Collection(
    name,
    {
      initial,
      actions: new Map<string, CollectionAction<number>>([
        [
          "increment",
          (branch) => {
            if (!branch) return 1;
            return branch.value + 1;
          },
        ],
        [
          "decrement",
          (branch) => {
            if (!branch) return -1;
            return branch.value - 1;
          },
        ],
        [
          "add",
          (branch, s) => {
            if (!branch) return s as number;
            return branch.value + (s as number);
          },
        ],
        ["zeroOut", () => 0],
      ]),
      cloneInterval: 6,
      serializer(params: ValueProviderParams<number>) {
        const {value} = params;
        return (value === undefined ? 0 : value)
      },
      validator(v) {
        if (Number.isNaN(v)) throw new Error("must be a number");
        if (v !== Math.floor(v)) throw new Error("must be integer");
      },
    },
    f
  );
}

describe("README.md", () => {
  it("should run example 1", () => {
    const f = new Forest();

    const t = f.addTree<number>("counter", { initial: 0 });
    t.subscribe((value: number) => {
      message("tree change", t.top?.cause, ":", value);
    });

    const growBy = (n: number) => ({
      mutator(mParams: MutationValueProviderParams<number>) {
        const { value, seed } = mParams;
        if (value === undefined) return seed;
        return Number(seed + value);
      },
      seed: n,
      name: "growBy " + n,
    });

    t.grow(growBy(3));

    // 'tree change growBy 3 : 3

    t.grow(growBy(4));

    // 'tree change growBy 4 : 7

    t.next(100, "set to 100");

    // tree change set to 100 : 100

    // (presuming the previous history)

    let current = t.top;

    while (current) {
      message(
        "README.md -- at",
        current.time,
        "cause:",
        current.cause,
        "value:",
        current.value
      );
      current = current.prev;
    }
    /**
     *
     *  -- at 7 cause: set to 100 value: 100
     * -- at 5 cause: growBy 4 value: 7
     * -- at 3 cause: growBy 3 value: 3
     * -- at 1 cause: initial value: 0
     */
  });

  it("collection example", () => {
    const counter = makeCounter(0);

    counter.subscribe((n: number) =>
      message("collection is ", n, "because of", counter.tree.top?.cause)
    );

    counter.act("increment");
    counter.act("increment");
    counter.act("increment");
    counter.act("add", 100);
    expect(() => counter.act("add", 1.5)).toThrow("must be integer");
    counter.act("zeroOut");
    counter.act("add", 300);
    counter.act("increment");
    counter.act("decrement");
    /**
     *      
      collection is  0 because of initial
      collection is  1 because of increment
      collection is  2 because of increment
      collection is  3 because of increment
      collection is  103 because of add
      collection is  0 because of zeroOut
      collection is  300 because of add
      collection is  301 because of increment
      collection is  300 because of decrement
     */
  });

  it("occasionally caches", () => {
    const counter = makeCounter(0, "counter:cached");

    counter.act("increment");
    counter.act("increment");
    counter.act("increment");
    counter.act("add", 100);
    expect(() => counter.act("add", 1.5)).toThrow("must be integer");
    counter.act("zeroOut");
    counter.act("add", 300);
    counter.act("increment");
    counter.act("decrement");

    let t = counter.tree.top;
    while (t) {
      message(t.time, ":counter value: ", t.value, "cause:", t.cause);
      t = t.prev;
    }
    /**
     *   
        29 :counter value:  300 cause: decrement
        26 :counter value:  301 cause: increment
        23 :counter value:  300 cause: !CLONE!
        22 :counter value:  300 cause: add
        19 :counter value:  0 cause: zeroOut
        13 :counter value:  103 cause: add
        10 :counter value:  3 cause: increment
        7 :counter value:  2 cause: increment
        4 :counter value:  1 cause: increment
        1 :counter value:  0 cause: initial
     */
  });
});
