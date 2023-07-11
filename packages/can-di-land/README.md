# [Can-di-land](https://www.npmjs.com/package/@wonderlandlabs/can-di-land)

This module creates a registry of content that used dependency injection(di) rules
to enforce dependency rules. Its purpose is to define systems with multiple -- potential nested -- 
dependencies, to ensure that all required configurations are in place.

It also allows you to distribute and share dependencies across multiple systems, and to enforce
business logic. For instance, some entries may be re-definable; some you may want to "lock in"
and never change once they are resolved. 

Dependency Injection is prevalent in Angular but absent in React and well -- "not Angular".
I used BottleJS previously but wanted to see if I can "reinvent" it to meet my particular needs. 

## The use case that triggered this module in the first place

I was writing a graphically intensive UI / React application. At the first cut, its control systems
were scattered across multiple systems, with multiple contexts. I wanted instead to 
create a single context provided global "manager". 

This manager had multiple components that the UX could call and have the modules wrapped in a
HOC delayed providing a view component until its required components were present in the manager.
Also, it was clear that some components would require _other_ components to be present.

Given the number of moving parts it soon became clear that it would be better to move the manager
definition into a more rigorously tested system. 

To be concrete -- some fo the components present were:

* the **data** component - essentially an RxDB database using Dexie as a local store. 
* the **message** component - emitted notifications and presented modal dialogs
* the **interaction** component - handled mouse/keyboard input
* the **loader** component - handled tracking whether all needed resources were available, /  
  and locked the system while a save was taking place
* the **configuration** component - handled taking in user options and broadcasting them to  /
  other components to change the behavior of the application

The configuration component was dependent on the data component, as was the loader. 
The message component used the interaction component to suppress mouse / keyboard reactions while
a modal dialog was active. 
The loader component suspended interaction while data was being loaded/saved. 
Amd with more components coming down the pike I wanted to ensure the system had integrity. 
I also wanted to ensure that I didn't load more components than was necessary for a given page to operate.
For instance, the page that loaded projects didn't need the configuration component to be present
until a project was loaded.

## Some Behavior of CanDI instances

* a registered entry is only considered resolved when its dependencies (if any) are all resolved.
* registered entry values can be re-set
* if a entry is configured to be "final" it can only be set once; re-sets will throw errors.
* get(key) is asynchronous; it only returns when dependencies are resolved.
* value(key) is synchronous; it returns undefined (but does not throw) if the entry for key is pending. 
* if maxTime is passed to get(key, maxTime), it will throw if dependencies are not resolved before the time limit.
* it is not an error to call `get(key)` or `has(key)` before the entry key has been defined. 

## A few notes on terminology 

The terminology used here isn't based on any formal or theoretical model;
just observed patterns of key/value usage in the JS community. There are cases where a term has a 
synonym described below in parentheses.

* **Entry** (a.k.a. "entity") A collective term for everything keyed off a single key; 
  this includes the key, the resource and the value
* **Key** (a.k.a. "key") A unique value used to identify a single Entry. /
  In general, keys are strings; but as they are used throughout as Map instance keys, 
  practically any JS token can be used as a key. 
* **Resource** The resource is "that which produces the value associated with a key." 
  For Value type entries, an entries' resource _is_ its value. For 'func'/'comp' entries, 
  they are the _basis_ for an entries' value. 
* **Value** The _expression_ of an entries' resource. 
* **Type** the variation of how an entry expresses its value based on its resource. 
  currently the type options are 'value', 'func' and 'comp'.
* **config** (a.k.a. configuration) The behavioral modifiers that affect how a resource is transmuted into
  a value, including how often / if its resource can be updated, injected args for function-based
  entries, and whether it is asynchronous. Configuration _must_ include type, but all other fields
  in a configuration are optional. 
  Configuration is stored internally as a POJO meeting the type requirements detailed in `type.ts`.
* **Resolved** (antonym: pending) An entry is resolved when it's value is "pending". Async 'func' / 'comp' 
  entries are resolved when its promise completes (for the first time). Even if its resource
  is updated later on, it is considered "resolved" and presents its former value until the next 
  promise resolution. (I.e., when an entry resolves, it stays resolved,
  even if its resource/value changes). 
* **Registered** (a.k.a. defined) entries have a defined configuration paired with a given key. 
  (and usually, it also has a resource as well.)
  Resolved entries are by definition Registered, but not necessarily the other way around. 

## Resource types and configuration

The first time a value is set, it must have a configuration:

```javascript
import { CanDI } from '@wonderlandlabs/can-di-land';

(async () => {
  const can = new CanDI();
  can.set('foo', 100, { type: 'value' });
  // NOT awaited
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
})();
/**
 * the sum is  400
 * after 100 ms, the sum is  500
 */
```

A few things to call out:

1. 'sum-of-foo-and-vey' is "got" before it has been defined.
2. 'sum-of-foo-and-vey' is a 'comp' (resolved) value; it's value is the result of executing the defining function
3. the dependencies of the configuration of 'sum-of-foo-and-vey' are injected in the order they appear in the config;
4. the dependencies of 'sum-of-foo-and-vey' have not been defined when it is added
5. vey is set twice -- synchronously -- but the async resolution of vey accepts the second value.
6. the final set of 'vey' triggers the execution of the `get()`'s 'then' clause.
7. An async set of foo to 200 is too late to be considered by the "get" computation, for the first get.
8. However, it the change of foo _does_ happen before the final get, as shown in the console output.

Also, the result of a computation is cached; so it will be referentially consistent as long as the inputs
are not changed.

## resource types:

There are three types of resources:

### **values**: `value`

Value resources have no dependencies, by definition.
They can be of any things - Arrays, Dom Objects, streams, functions, Class definitions, etc.

The value returned from `set` is exactly the value passed in to `set`

### **functions**: `func`

Functions must be javascript Functions. Their dependencies, if any, are curried in front of any arguments.

### **resolved values**: `comp`

Computed values are defined by a function that derives a value from their dependencies.
The resource is in fact a "Factory" for the returned value.
The factory computes based on the dependencies, and its value is updated every time a dependency changes.

## Configurations

The only mandatory field in a resource's configuration is type. You can in fact pass a type string instead of
a config and it will interpret it correctly. All of these are valid calls:

```javascript

const can = new CanD_oldI();
can.set('foo', 100);
can.set('bar', { type: 'value' });
can.set('foo2', 100, 'value');
can.set('bar2', () => 400, 'comp');
can.set('vey', () => 400, 'func');
```

Here are the possible (optional) configurations you can pass in:

* `final` (boolean) :: default: false; the resource cannot be changed
* `computeOnce` (boolean) :: default: false; the output of a 'comp' function does not change once its dependencies are
  met. \
  This is important if, for instance, your factory function produces a class instance that you then use deeply in your
  application.
* `bind`: an instruction to bind comp/func methods to the can
* 'meta': defines rhe resource as a function that produces a function (for comp/func types)
* `async`: has a range of implications depending on the type
* `type` (see above)  'func'| 'comp' | 'value' (string) :: default: 'value'
* `deps`  any[]. default []; the other entries that must be resolved for this entry to be considered resolved.
* `args` any[] :: default []; Additional arguments that are curried in front of the arguments to 'comp' or 'func'
  entries.

As mentioned before only type is a required parameter.

## Setting a resource multiple times.

You can redefine any resource as many times as you want -- unless the value is `final`.
Redefining 'comp' or 'func' values is possible and will clear the cache.

Note - you **cannot change the configuration of a value once it is registered. That is, the third argument to 'set'
is ignored once a named value has been registered.

## Removing an entry

There is no way to delete an entry. The design of CanDI is to create a write and read store;
once resolved an entry can be changed but never removed. Because of the dependency network that CanDI
creates, once keys are resolved they are considered eligible to provide values, for the lifetime of the 
CanDI instance. Removing and un-registering a value would create complex, unreliable side effects for the
entries they support. 

## Resource keys

In this example and the tests, all resources have string keys; this is a pretty common assumption.
It is the best and simplest way to register values ina `CanDI`. (take care with blank spaces and casing of course.)

However, it is not a *requirement* that entries are keyed with strings.
You can in fact use numbers, symbols, dom objects or any valid input to a javascript `Map` instance
to key your values in a `CanDI`. Just make sure you understand the keying implications
of the Map class when it comes to key uniqueness.

note: its not a good idea to use arrays as keys; they are seperated into multiple entry keys
when passed to `get()` or `when()`.

## Entries, resources and values.

an Entry is a definition that is paired with a specific key. When you call `myCan.set(key, resource, config?)`
you define an entry for that key, which is available (and listed under `myCan.registry.get(key)`).

The second argument to `myCan.set(key, resource, config?)` is called a `resource`. It is stored in
`myCan.registry.get(key).resource`.

The *value* of a registered item is returned by `myCan.value(mame)` -- a synchronous function.
the _immediate_ value of a registry item by the _async_ function `myCan.get(key)`.
it returns a Promise that resolves when the dependencies are provided.

* For `value` types, the resource and the value are in fact identical (and referentially identical), to what is returned
  from `get(key)`.
* For `comp` (factory) types, it is a function _that produces the value_, which you retrieve from `myCan.get(key)`.
* For `func` types it is decorated with a secondary functional wrapper to include any derived values.

### Pending, undefined, defined and resolved entries

Entries that have not been defined -- or defined entries with undefined/pending dependencies -- 
are considered "Pending"; they are undefined when `myComp.value(key)` is called, a
nd will delay completion of `myCan.get(key)` until they are resolved. 

Entries that have been defined, and have pending/undefined dependencies, are considered "pending";
they are present in the registry but will hold up `get(key)` Promise resolution. 

An entry is considered **resolved** (and not **pending**) if:

* it has been defined
* all its dependencies have been resolved

'value' type entries are always resolved once they are defined. 

Note that for `pending` comp or func entries 
-- entries whose listed dependencies are not resolved --
will always return undefined. from `myConp.value(funcName)`. 

An entry is **defined** when its parameters have been `set(key...)`. 
It will have an entry in the `myComp.registry` Map, 
but may be pending if their dependencies are not resolved. 

## async `myCan.get(key, maxTime?)`

The get method is async; it completes when all the required dependencies have been defined.
For values, which by definition cannot have dependencies, it returns as soon as the entry is defined.

You can call `myCan.get(key)` before an entry is defined.
It will error ('time out') in the next execution cycle if the entry has not been defined at that time.

In order to prevent a `get()` call from hanging forever, the get call will terminate after a certain time.
If you pass maxTime to the get call, that is how long it will wait before returning.
(it will throw if that time expires before the dependencies are provided)

that is -- get will retrieve an entry value if

* it is defined before the maxTimeout time (or already defined)
* it has no dependencies or
* its dependencies are defined before the maxTimeout time

## sync `myCan.value(key)`

value is immediate; it returns undefined unless the entry _and its dependencies(if any)_ are defined
before `.value()` is called.

## async `myCan.when([key, key2, ...keyN] | key, maxTime?)`

`when()` accepts a single key, or an array of keys. it returns a promise that resolves when
all the listed dependencies (and _their_ dependencies) are defined, or throws when the maxTime elapses.
It is used internally by `.get()` but can be used to delay any sort of activity until
a set of dependencies resolves.

It accepts a single entry key or an array of entry keys.

## sync `myCan.has(key | [key])`

returns true if the entry and its dependencies (if any) are _currently_ defined/resolved.

## Curried arguments to 'comp' and 'func' entries

Several arguments may be prepended to the function resource of an entry:

* first, the dependencies (deps) in the config are appended. (by definition, they must be resolved before the function
  is every called / available)
* second, if any other arguments are provided in the configuration, they are appended.
* Lastly, if any parameters are passed into the function (for a 'func' entry) they are passed in.

here are some examples of config parameters being "pushed in front" of calling parameters:

```javascript

function point3(x: number, y: number, z: number) {
  return ({ x, y, z });
}

const can = new CanD_oldI();
can.set('point', point3, 'func');
console.log(con.value('point')(1, 2, 3));
//  {x: 1, y: 2, z: 3}
can.set('pointA', point3, { type: 'func', args: [100] });
console.log(con.value('pointA')(1, 2, 3));
// {x: 100, y: 1, z: 2}
can.set('pointDA', point3, { type: 'func', deps: ['x'], args: [100] });
can.set('x', 200);
console.log(con.value('pointDA')(1, 2, 3));
// { x: 200, y: 100, z: 1 }
```
Because there is no rule against calling a function with more parameters than it is equipped to accept,
some parameters of the call are not present in the output point. 

## Entry types / TypeScript

There is at this point no type restraints on entries, except the resource for a 
'comp' | 'func' entry be a javascript function. 

## Project status / use cases

**This module is in early / alpha development ** and has not been rigorously tested in real world apps.

It is designed to be usable in general browser applications and Node.js; It has only a very light
dependency on rxjs. 

## Async and resolved values

if the configuration `async` is set, it has different effects on different data types. 

* async `value` types are assumed to be set as a Promise. the value is not "resolved" \
  until the promise resolves. 
* async `func` types aren't treated any different from sync `func` types - the output of the \
  function may be async but that is not factored into any consideration of the can code. 
* async `comp` types' values are extracted from the promise when recorded as the entries' value. \
  
If the dependencies change before the promise resolves your comp's resolution may be preempted 
 -- however computeOnce `comp` entries will always complete with the first set of dependencies.

## `final` and `computeOnce` 

final entries' resource can never be changed. For `value` and `func` entries, this is the only
thing that matters. However -- for `comp` values there is another wrinkle: the factory function
may stay the same but if the _dependents_ change, the factory value will be updated to reflect the
new dependencies. 

`computeOnce` determines that resolved factory values are only produced once. This is important for
entries that are, for instance, data registries or other fundamental building blocks that must
maintain referential integrity for the lifespan of the app.

There is one _very subtle exception_. ComputeOnce entries are "committed" only after all the dependencies
are present. So, if the entry is _not_ final, and you change the function _before_ its first computation,
the second factory _will_ be used to compute the entry. This is, pedantically, can-di-land performing
as designed. Effectively, you switched guns while it was still in the holster.

To prevent this edge case, it's probably best to make your computeOnce `comp` entries final as well. 

## binding and meta methods

There are times when you want to bind a function that is the resource for 
comp and func entries to the can; mainly, to let the function access methods, and generate other entries.

To pull this off, a "classic" javascript function is necessary; you can't bind lambdas, and 
depending on your compilers, you may have to use the 'meta' property: 

```typescript

const can = new CanDI([
        {
          key: 'meta',
          value: () => (function () {
            //@ts-ignore
            (this as CanDI).set('foo', 'bar')
          }),
          config: {
            type: 'comp',
            bind: true,
            meta: true,
            computeOnce: true
          }
        }
      ])
```

note - since meta is true and bind is true, internally, the function _that value outputs_
is then bound to the can, which then, when called, sets another entry ('foo') to 'bar'. 

If you want to bind your resource function to something _else_ you can set meta to true
and omit bind; then, internally to the value meta-function, you can bind
your factory function to whatever you want. 

```typescript

const point = { x: 100, y: 200 }

const can = new CanDI([
  {
    key: 'meta',
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

console.log(can.value('meta');
// 224
```

## sequence of function execution

Sometimes it's very important to know _when_ a method is going to be called. 

* any function that is set as a 'value' type will never get called by CanDI.
* a 'comp' function with no dependencies will get called as soon as it is defined (with `set()`);
* a 'comp' function with dependencies will get called as soon as its dependencies are resolved. 
* a 'comp' function with dependencies that is not 'computeOnce' will get called as soon as its dependencies change. /
  (once they are all resolved. )
* a 'func' with 'meta' = true's _meta-function(value)_ will get called when it is created. /
  However the returned function will never get directly called by can. 
* a 'func' function that has no 'meta' flag will never get directly called by can. 
