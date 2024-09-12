# Forest 3.0 : "Forestry"

Forest is an attempt to create a journalled, transactional synchronous, query based muuti collection ecosystem.

It is intened as a Redis Killer for client side / react apps, but can have other applications.

## Journeled

every collection -- 'Tree' -- has an initial k/v store. Every update is a linked list that defines the key/values that are added or deleted.
These changes are synchronous - that is, the update is appended to the tree and creates a subsitute value(values) for the base.

This means, you can observe not only what the state of an individual collection was at a specific time, but what the state of the entire ecosystem _was_ at a given point, and annotate each change with a name to allow for bug tracking as far back in time as you want to go.

## Transactional

Collections assert changes inside of a "do closure" (in the Forest they originate from) and run all validators on changed trees before each closure is completed.
Trees with invalid data are "trimmed" - changes are retained in each trees' `offshoots` property for inspection.
This means, you can write validators which can traverse an entire (pending) tree in committable state and interrupt a trees' status, trimming
bad data off the tree before any changes are broadcast. This allows you
to validate collections not only based on their current state but on their
relationship with other collections.

## Observable

All trees express the Observable interface of RxJS, including an exposed subject property, so they can be subscirbed to using familiar Rx patterns.

## Customizable

You can write a completely unique "engine" on top of a tree collection
that uses one or multiple trees to define an ecosystem. A form can be modeled using the provided engine which blends a collection for fields with a collection of form parameters with open customization.

## Open-ended

Any type of data you wish can be contained with in a Tree; Maps, DOM, database connections, Immer instances, etc. As long as you can define how you want your data to change and it can be held by a javascript reference, it can be managed with a tree.

# The Forest Contract

As with previous iterations of Forest, Forest stores are

- Quick to define
- transactionally contain
- allow actions to call each other with indfeinate depth for orchestration
- Can be used globally or locally
- minimize view notification by only broacasting outside the outermost transaction
- produce synchromous change and can always be immediately inspected for current value

the principal change for Forest 3.0 is that the Engine is no longer a class instance defiend by the Forest library but (can be) a custom class with your own action definitions. It also has even fewer depenencies than the previous iteration.

# Terminology

The Forest model is a three-tiered state mangement system. Each change is encased within a **Branch**, which is a linked-list node that extends history over (numerically indexed) time.

Branches are contained within **Trees** which are a named unique collection of the history of a single item of state.

Trees are contained within a **Forest** which manages a namespace of Tree instances, enforces a timeline and allows for transactional containment of change.

## A quick example

you can grow by adding a "Growth function" which returns a dynamic value
based on the linked list chain, or force a value into a tree with the `next` method.

```
const f = new Forest();

const t = f.addTree<number>("counter", { initial: 0 });
t.subscribe((value: number) => {
  console.log("tree change", t.top?.cause, ":", value);
});

const growBy = (n: number) => ({
  mutator({value, seed }) {
    return Number(seed + (value ?? 0));
  },
  seed: n,
  name: "growBy " + n,
});

t.grow(growBy(3));

// 'tree change growBy 3 : 3

t.grow(growBy(4));


// 'tree change growBy 4 : 7

t.next(100, 'set to 100');

// tree change set to 100 : 100

```

at any point you can "run back in time" through a tree's list:

```
let current = t.top;

while (current) {
  console.log(
    "README.md -- at",
    current.time,
    "cause:",
    current.cause,
    "value:",
    current.value
  );
  current = current.prev;
}
});
/**
*
*  -- at 7 cause: set to 100 value: 100
* -- at 5 cause: growBy 4 value: 7
* -- at 3 cause: growBy 3 value: 3
* -- at 1 cause: initial value: 0
*/

```

## Collections can use proxies to conserve memory

Keeping large collections up to date with history can eat up memory. To make things less wasteful, engines can use proxies to create "tweaked versions" of historical data that are the same _except_ for a single key / value that was changed.

for instances where available, the MapCollection's 'set' action creates a proxy of the previous edition that is the same, except that the size is changed and the value of a _single key_ is different when `value.get(key)` is called.

this means that if you have a 500 item map and you set five keys to different values (one by one)
your history is not 6 x 500 items big: it has one 500 item map as the initial value, and
five fixed-size proxies to emulate maps with slightly different values.

(see [README.caching.md](./README.caching.md)) to see how we can serialize proxies ittermittently
to limit the callback depth of series of proxies)

(also, for IE and other runtimes without proxying, non-proxy options are provided).

# "Just enough API

Everything in Forest extends from a Forest instance. it is a "database of trees"
and synchronizes transactions in functions that can change multiple trees, so that in an
error, all the trees are reset to their pre-function state.

## Forest:

- `addTree<ValueType>(name, {initialValue: ValueType})`: new TreeIF<ValueType>
- `hasTree(name: string)`: boolean
- `uniqueTreeName(likeName: string)`: string
  > if you want to produce a new unique name for addTree
- `tree<ValueType>(name: string) : TreeIF<ValueType> | undefined
  > retrieve a previous tree _if it exists_
- do<ResultType>( doFn) : ResultType
  > (throws) perform any actions and emit a single change to any previously defined observers: synchronous
  > doFn = (f: Forest) => ResultType
- `observe<ValueType>(name: string)`: SubjectLike<ValueType>
  > returns a subscription to a named tree, that only emits after all do()'s are complete.

## Tree:

Trees are made from(in) forest instances.

- (constructor): (name: string, params: TreeParams)
  parameters are:
  - validator?: (value: ValueType, tree: TreeIF<ValueTYpe>)
  - initial?: ValueType
- `name`: string
- `value`: ValueType
  > shortcut to this.top?.value
- top?: BranchIF<ValueType>.
  > while any tree with an initial value will have a top there are some
  > circumstances where the tree may be "without branches" -- if validators disallowed all submissions, or there is no initial parameter.
- `next(nextValue: ValueType, cause?: string): void
  > sets the value of the tree to the defined overwrite; may throw if validators present.
- `grow(change: ChangeIF): BranchIF<ValueType> (the top)
  > contians a "mutator" function that parametrically derives its value
  > based on a seed and previous branch
- `valueAt(time: number) // the value of the branch "in history" at (or just before) the given time
- `validate(value: ValueType) : {isValid, value, tree, error?: string}
  > if you want to "test an input" before committing it to state,
  > validate tries the value against any validators; doesn't throw,
  > but returns feedback in a handy object
- `offshoots`: {time, errror, branch}[]
  > invalid branches removed during submission due to validation failures

## Branch:

Branches should in general not be messed with externally; their one outward facing field is `value` but that may as well be accessed indrectly, off their tree; the exception may be examining offshoots

## changes

a "change" is an annotated action. It can be either a

### Notes

If you want to throw a message into the history of the tree (or forest),
you can call the `.addNote(message: string, Params?: {})` method of a tree or forest and add a viewable memo. Trees or forests' notes can be accessed off the `.notes(time)` or `notes(time, time)` method to view
any annotations.

next/grow do not by design add to the notes collection to avoid duplication, but branch-scouring in combination with manual annotation
may be useful.

The notes list in forest and that in individual trees are distinct and unrelated; tree notes will include the name of the tree.

# What can you put in a tree?

Forest puts no limit on what a tree can store. That being said - _simple values_ make the best candidate for a tree. As a rule of thumb if it can be processed by JSON.stringify, or is a
Map of things that are "stringifiable" and keyed by strings or numbers.

Class instances, functions, DOM fragments all are not good candidates for Tree storage; its best to find some other way of storing these things such as keeping them in a seperate map
and referring to them with ID numbers/strings.

Objects and arrays are valid, but ideally are not deeply nested or overlong.

# Collections

An collection is a "class that uses Forest". It can add, manipulate and filter
trees. Collections that are based on the Collection class (and satisfy the CollectionIF) is based on a specific (single)
tree and will allow for controlled manipulaition of its values.

- a MapCollection uses proxied maps and exposes "mappy" methods.
- a FormCollection is a "multi-tree" engine that puts form-centric properties in one tree and a map of detailed form-centric fields. Its validators, unlike Forest validators, express errors for "bad values" without throwing/pruning trees, allowing the user to enter values for fields as they may and providing real time feedback for field falidation.

## Custom Collections

You can create any class you like around a tree/forest paradigm. you can create "change methods" in any manner you like. However, the Collection class has a custom "actions" property in its parameter that lets you define methods as you will, wrapping each in a transaction (`do()`) wrapper for sanitation.

Collections will create a forest if not injeted as a parameter; if you
have a simple "single tree" use case, a Collection will do just fine.

```

    const f = new Forest();

    const counter = new Collection("counter", {
      initial: 0,
      actions: new Map<string, ChangeFN<number>>([
        ["increment", (branch) => {
            if (!branch) return 1;
            return branch.value + 1;
        }],
        ["decrement", (branch) =>{
            if (!branch) return -1;
            return branch.value - 1;
        }],
        ["add", (branch,s) =>{
            if (!branch) return s as number;
            return branch.value + (s as number)
        }],
        ["zeroOut", () => 0],
      ]),
      validator(v) {
        if (Number.isNaN(v)) throw new Error("must be a number");
        if (v !== Math.floor(v)) throw new Error("must be integer");
      },
    });

    counter.subscribe((n: number) => console.log('collection is ', n, 'because of', counter.tree.top?.cause))

    counter.act('increment');
    counter.act('increment');
    try {
    counter.act('add', 1.5)
    } catch (e) {
      console.log("--- error:', e.message);
    }
    counter.act('increment');
    counter.act('add', 100);
    counter.act('zeroOut');
    counter.act('add', 300);
    counter.act('increment');
    counter.act('decrement');
    /**
     *
      collection is  0 because of initial
      collection is  1 because of increment
      collection is  2 because of increment
      --- error: must be integer
      collection is  3 because of increment
      collection is  103 because of add
      collection is  0 because of zeroOut
      collection is  300 because of add
      collection is  301 because of increment
      collection is  300 because of decrement
     */

```

since these mutation functions are **calling each other** through history, we set the collection to "hard cache" its value every six actions. What does that do? if we were to "crawl the history" we'll see the occasional "cache action":

```

const f = new Forest();

const counter = new Collection("counter", {
  initial: 0,
  actions: new Map<string, ChangeFN<number>>([
    ["increment", (branch) => {
        if (!branch) return 1;
        return branch.value + 1;
    }],
    ["decrement", (branch) =>{
        if (!branch) return -1;
        return branch.value - 1;
    }],
    ["add", (branch,s) =>{
        if (!branch) return s as number;
        return branch.value + (s as number)
    }],
    ["zeroOut", () => 0],
  ]),
  cloneInterval: 6,
  cloner(t: TreeIF<number>) {
    return t.top ? t.top.value : 0;
  },
  validator(v) {
    if (Number.isNaN(v)) throw new Error("must be a number");
    if (v !== Math.floor(v)) throw new Error("must be integer");
  },
});

counter.act('increment');
counter.act('add', 100);
counter.act('zeroOut');
counter.act('add', 300);
counter.act('increment');
counter.act('decrement');

let t = counter.tree.top;
while (t) {
  console.log(t.time, ":counter value: ", t.value, "cause:", t.cause);
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
```

everything you'd expect except for the !CLONE! at time 23. What is that?
Well, as we added this to the constructor:

```
{ // ...
  cloneInterval: 6,
  cloner(t: TreeIF<number>, branch?: BranchIF<number>) {
    if (branch) return branch.value;
    return t.top ? t.top.value : 0;
  },
}
```

note- the cloner may either target a specific branch's value (if the second parameter is present) or the tree's top branch (if there is no second parameter); and there is
also the possiblity that _both_ branch and tree.top is absent. (see above example)

every six changes, the cloner adds a hard value so that the mutators don't callback too deeply. Mutation functions are nice in that they can reduce memory from history, but if there
are too many of them you want to break the callback chain with an asserted literal value.

# Caching and Cloning

in order to maintain referential uniqueness, mutator outputs are cached. Caching has a lot of
little considerations - see [README.caching.com](./README.caching.md) for details.
