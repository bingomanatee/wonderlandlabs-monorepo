# Forestry 4.0

This is an attempt to simplifiy and pathify Forestry to deemphasize features that
turned out to be not useful in production and focus on truly useful artifacts and patterns.

## 1. Optional Transaction

Transactional integrity will only occur on demand; given the production use case
rarely requires atomic transactions they will only be present on request.

## 2. Homogenized structure

Instead of the Forest/Tree/Collection duality which was an unhelpful metaphor
we will be essentially flattening everything in the system to stores; both Forests(the root)
and Trees(sub-data) will expose the Store interface of a value, actions and subscriptions
and most of the interface of Subjects from RxJS

## 3. if it's good enough for Redux Toolkit: Immer

We wil be encasing all data in Inmer constructs.

## 4. All mutations are custom

Other than updating the value with next() any sugar you want to put around updating a store
will be a custom action; eg; update, set, get, etc.

# The Store Interface

The Store interface is a decorated observable;

## A word on values and paths

### values

absolutely ZERO control is made over the structure or form of the stores' values
(until you create your own assumptions with schema and validation tests).

values can be scalars, arrays, objects, Set's or Map's . Symbols even. The only
requirement is that they be _immerable_. This means most JavaScript structures and even
some instances of classes are valid; however immer _aggressively_ changes references so
you cannot depend on properties' reference targets being preserved during mutation.
(one of the many reasons that you cannot for instance use Dom nodes as state values)

However if you apply a path to a target, it must be a complex type (Object, Map, Array) for which
sub-items are relevant. 

### paths 

A Path is either a period delimited string (`'user.namee'`)
or an array of path fragments (`['users', 100, 'name']`)
path fragments can be glob patterns `/^[\w]{4}-[\w]{5}$/`,  wildcard ('*') or deep wildcard: (`**`)
indicating any number of sub-paths. You can use dynamic patterns for get; if you pass a second number,
it will return the first N items, or all of them if you pass true);

You cannot embed Regex values in strings; you must use the array form to enclose Regexes in paths / path elements.

You cannot therefore get a path value from a static element such as a string or number; attempting
to do so will throw an error.

### "self" path

null or [] are considered "self paths" that represent the entire value of a store. they are legitimate though they
are wierd and potentially expensive; you can 
for instance create a tree that is a clone of the entire store. 

### unresolvable paths

Attempts to get an element rom a path that cannot be resolved (eg, `'user,id'` from `{user: {uid: 200, name: 'bob'}`)
will return undefined but will not throw.

### Dynamic paths

any path with '*' or '**' elements or regexes in it is dynamic - it is a search query that 
can resolve to zero, one or more sub-values. These are fine for schema or test validators, 
but not say, for `set` or `makeTree()` in which a concrete (non dynamic) path is required
to set the value. 

### Multiple paths

Multiple dynamic paths are possible for path keyed maps eg for schema and tests.
It is _likely_ the first matching path is going to be accepted for any given scenario,

However in some circumstances it may actually be ok. for instance if you describe
schema for a database-like store's id fields as this:

```javascript
schema: new Map([
  [ `['*string',  '*map', id'], z.uuidv4()], // all record ids (in all maps) are uuids 
[ ['*string', z.map(z.uuidV4(), z.object()], // all tables are maps of records 
['users', z.map(z.uuidV4(), ZodUser), // a more specific schema for users 
]);

```

when validating all changes to users all relevant schema may be compared; ie., when adding a new user,
the id will be validated from the first schema, it will be validated as a generic object by the second
and the third schema will compare the resulting user to the predefined ZodUser schema.

Similarly you may have a test on the id with say a character constraint for the user name, 
and a map constraint on the user table to prevent duplicate ssns for all users. 

### Shards

the value that a path "points to" is called a "shard" for short - it is a subvalue (tree) of a larger store.

## Observable attributes

### `value: <DataType>`

Value is the latest broadcast state of the store; like BehaviorSubjects the value
is always present and conforms to the schema and (hopefully) the generator type of the store.

### `subscribe(listener: Listener): Subscription`

Subscribe provides obseverable functionality. Unlike "dumb Subjects" that
automatically broacast every time next is called, Forestry puts validation criteria
between a _candidate_ and an observable _change_ to the current value of the store.

Also only _meaningful_ change is broadcast via the distinct filters

### `next(candidate: DataType)`

submits a candidate for updating the store. After validation, broadcasts update to all
subscribers.

### `complete()`

freeze the state and prevent updates.

### error(e: Error);

freeze the state and emit an error to all listeners.

### isActive: boolean

Useful for finding out if a store has been completed/frozen

## Action methods/attributes

Actions are decorators around next() to allow more interesting IO;
they can return a value, call store methods, neither or both.
Actions can be sync or async; however async methods cannot achieve
guaranteed transactional integrity, by definition.

note - the stores' actions methods are functions bound to the store itself so you can use "this" to refer
to the store and its methods (isActive, etc.);

### the value - actions's first parameter 

Stores will inject the current value of the store into the first parameter of each method; 

if you have a count store:

```javascript

const counter = new Store<number> (
  {
    schema: z.number(),
    value: 0,
    actions: {
    increment(n) {
    this.next(n + 1);
    },
    decrement(n) {
    this.next(n - 1);
    },
    loop(n) {
      this.$.increment();
      this.$.decrement();
    },
    addd(n, m) {
    if (typeof m !== 'number'){throw new Error('must be a number');
    }
    this.next(n + m);
    },
  }});

counter.$.increment(); // notw - WE DO NOT pass the vavlue into the method it is atomatic
console.log('value is', counter.value); // 1;

counter.$.add(4);
console.log('value is', counter.value); // 5
```
we don't have to pass in the current value - it is done behind the scenes for us. 

Also, it's quite likely in a long action the value will get out of date; check `this.value` for 
the most up to date version of the value. 

### ActionMethodRecord / ActionMethodFn vs. ActionRecord /ActionFn

In the type system there are two flavors of actions; `ActionFn` (which have 0..? args) and 
`ActionMethodFn`s which DO have a first parameter DataType and optional arguments (eg 1..? args). 

the ActionFn is what is _exposed_ on `store.$` and `store.acts` of each store. 
the ActionMethodFn is what is passed ino params in an ActionMethodRecord object. 

so the ActionRecord exposed on the generic type Store is the _user facing interface_ (action functions) 
which delegates to the value-prefixed actions defined in the constructor. 

that is the _creator_ writes action in long form with a value arg; the user _gets_ the short form 
(without having to add value). 

### Action Return Values

Actions can return values - but they don't have to. If they do its is a good idea to define the Actions 
interface of your actions to maintain type safety. 

Actions may change the value of its subject, and may even do so multiple times. All changes are broadcast at the 
completion of each action. 

### Errors and Rollbacks

Any uncaught validation errors are thrown and cause state to "rollback" to the last good version; this will
_not_ terminate the store but will suspend all changes unless an enclosing action contains and catches the error. 

(more on this later)

### Termination of stores

You can manually cause a store to terminate with an error on a deal-breaking error yourself
by calling `store.error('failed apis')`;
this will suspend future changes and make the store _inactive_ (`store.isActive = false);
next() calls will cause an error.

Trees may be terminated without terminating the root store. you can for instance create two stores 
from the same path and terminate one, but the other will still be active, as will the store that created them.

### Action resolution and subscriptions

Subscriptions only broadcast on the completion of all actions; the values are updated in the store,
but the user only gets an update at the completion of the outermost action. This is to reduce listener
overload. Also, only unique values are emitted; so in the above code, `counter.$.loop()` doesn't broadcast
because the ned value is the same and the original counter number.

### `acts|$`

User defined methods for selecting values and/or updating state

### `actions: Map<string, ActionFn> | Record<string, ActionFn> `

The input change functions that are the basis for acts/$

## Validation and Schema

Validation and Schema validate all store candidates before it is submitted.
Schema is a special criteria powered by Zod that ensures the candidates
conform to a specific pattern; essentially type gates; as the store is dynamic,
Zod provides the template of conformation.

All validation is optional but useful for maintaining quality data.

### schema: Map<Path, Zod> | Zod

you can define schema for a path or class of paths or just simply for the entire
store value.

### `tests: Map<Path, ValidatorFn> | ValidatorFn

you can define tests(validators) for a path or class of paths or just simply for the entire
store value.

ValidatorFn's are functions that return a falsy value / void if the value is correct,
and an error string / thrown error if the value fails to pass muster.

You can test the vailidity of an element or a shard with the `isValid(value, path?)`

## Mutation Helpers

### `set(candidate: any, path?: path)`

updates a part of the value and submits the new candidate as next; if path is absent,
is identical to next.
The path if present cannot be dynamic (with glob or regex elements).

set may accept a path with one extra field on a complex target. That is it will
add a field to an object, an element to an array or a key / value pair to a Map. 
however it cannot accept a multiply unset field eg 'foo.bar' because it cannot infer
the desired form of foo from context before adding bar to it. That will create a thrown error. 

The one exception is the '+' subpath - you can push() an value to an array or set with a '+',

### `get<Type>( path: path, count?: number | true = 1): Type | Type[] | undefined`

**Gets a value from the store. returns undefined if the path has no solution.
note - if the path is dynami**c (has a glob or regex) the first matching candidate is found;

* if a number is passed as the second argument, _that many_ results will be returned.
* if `true` is passed as a second argument, _all_ results will be returned

## Factories

Factory functions contain sub-stores for managing part of the root stores' values.
Changes,

* in the absence of an actions parameter, predefined actions from the branchTemplate may be
  applied.
* Schema, if pre-defined for a specific / dynamic path, are embedded in a tree at the relevant sub-path.
* tests, if predefined for a specific / dynamic path, are embedded in a tree at the relevant sub-path.

### `makeTree<DataType, ActionMethodRecord>(path: Path, actions: ActionRecord?): Tree<DataType>`

Makes a store out of a shard of the current Store; when the value of the store changes, it updates
the parent store's value -- and vice versa. In this way the main Forest can act as a "database" and
you can have ORM style trees for tables and records (or even more granular fields etc.) to
focus on a specific subsection of the

### `transaction<SubDataType>((Store<subDataType>) => void, path: Path?: acts?: ActionMethodRecordIF>`

Transactions copy the store value into a detached tree/store, passes it to a mutator, and
barring thrown errors, copies its value to the parent store upon completion.

During execution of the store all validation in the parent context is suspended.
This is useful for conducting operations in which invalid states may be temporarily
reached. note - in the unlikely event you subscribe to store, every change will be emitted,
so there is a likelihood that temporarily invalid valuse may be passed to a subscriber.

On completion of the enclosing function the store os completed/ not active so do not
attempt to reference the temporary store from outside variables; it won't be usfel after the function runs

The mutator is synchronous. During execution of a transaction all parent changes are delayed
until the transaction is competed; due to the un-threaded nature of JS this is not
likely to be a problem but any change queued during a transactions lifetime will be lost
if the transaction fails. Any async actions called inside a transaction mutator have un-predictable
results but will most likely fail as the subject will be locked post-mutation.

# Trees and Forests

A forest is a "Root store" with no parent or rootPath but conforms in all other
ways to the Store interface.

A tree is a client of the Forest that represent a sub-part of the forest such as a sub-record or sub-field

## Transactions and Trees and Forests

Transactions defer ALL changes ACROSS THE BOARD to the forest even sibling Trees or sub-Trees.
They establish consistent changes at the potential loss of a bit of performance.

## Trees / paths are _optional_

putting all your data in the root and only having a single, shallow state is
_perfectly fine_ - trees and pathing are advanced features that you don't need to
use Forestry 4.0. thus schema and validators can be defined using a complex pathing
scheme OR can be simple root value Zod items and ValidatorFn instances. 