# Forestry 4.0

This is an attempt to simplify and pathify Forestry to deemphasize features that
turned out to be not useful in production and focus on truly useful artifacts and patterns.

## 1. Optional Transaction

Transactional integrity will only occur on demand; given the production use case
rarely requires atomic transactions they will only be present on request.

## 2. Homogenized structure

Instead of the Forest/Tree/Collection duality which was an unhelpful metaphor
we have simplified everything to a unified Forest-based system. Forest is the primary class
that provides reactive state management with branching capabilities. ForestBranches extend
this functionality for managing nested data structures while maintaining the same interface.

## 3. If it's good enough for Redux Toolkit: Immer

We will be encasing all data in Immer constructs.

## 4. Subclass-Based Architecture

Instead of defining actions in constructor parameters, Forestry 4.0 uses a **subclassing approach**.
You extend the `Forest` or `ForestBranch` classes and add your own methods directly to the class.
This provides better TypeScript support, clearer APIs, and more familiar object-oriented patterns.

# The Forest Interface

The Forest interface is a decorated observable with branching capabilities;

## A word on values and paths

### values

absolutely ZERO control is made over the structure or form of the forest values
(until you create your own assumptions with $schema and validation tests).

**IMPORTANT: Forest values are immutable.** You cannot directly modify the `value` property.
To change the forest's state, you must use:
- `mutate()` method to transform the entire value or a specific $path within it using Immer
- `set()` method to update a specific $path with a new value
- `next()` method to replace the entire value

values can be scalars, arrays, objects, Set's or Map's . Symbols even. The only
requirement is that they be _immerable_. This means most JavaScript structures and even
some instances of classes are valid; however immer _aggressively_ changes references so
you cannot depend on properties' reference targets being preserved during mutation.
(one of the many reasons that you cannot for instance use Dom nodes as state values)

However if you apply a $path to a target, it must be a complex type (Object, Map, Array) for which
sub-items are relevant.

### paths 

A Path is either a period delimited string (`'user.namee'`)
or an array of $path fragments (`['users', 100, '$name']`)
$path fragments can be glob patterns `/^[\w]{4}-[\w]{5}$/`,  wildcard ('*') or deep wildcard: (`**`)
indicating any number of sub-paths. You can use dynamic patterns for get; if you pass a second number,
it will return the first N items, or all of them if you pass true);

You cannot embed Regex values in strings; you must use the array form to enclose Regexes in paths / $path elements.

You cannot therefore get a $path value from a static element such as a string or number; attempting
to do so will throw an error.

### "self" $path

null or [] are considered "self paths" that represent the entire value of a forest. they are legitimate though they
are wierd and potentially expensive; you can
for instance create a $branch that is a clone of the entire forest.

### unresolvable paths

Attempts to get an element rom a $path that cannot be resolved (eg, `'user,id'` from `{user: {uid: 200, $name: 'bob'}`)
will return undefined but will not throw.

### Dynamic paths

any $path with '*' or '**' elements or regexes in it is dynamic - it is a search query that 
can resolve to zero, one or more sub-values. These are fine for $schema or $test validators, 
but not say, for `set` or `makeTree()` in which a concrete (non dynamic) $path is required
to set the value. 

### Multiple paths

Multiple dynamic paths are possible for $path keyed maps eg for $schema and tests.
It is _likely_ the first matching $path is going to be accepted for any given scenario,

However in some circumstances it may actually be ok. for instance if you describe
$schema for a database-like store's id fields as this:

```javascript
$schema: new Map([
  [ `['*string',  '*map', id'], z.uuidv4()], // all record ids (in all maps) are uuids 
[ ['*string', z.map(z.uuidV4(), z.object()], // all tables are maps of records 
['users', z.map(z.uuidV4(), ZodUser), // a more specific $schema for users 
]);

```

when validating all changes to users all relevant $schema may be compared; ie., when adding a new user,
the id will be validated from the first $schema, it will be validated as a generic object by the second
and the third $schema will compare the resulting user to the predefined ZodUser $schema.

Similarly you may have a $test on the id with say a character constraint for the user $name, 
and a map constraint on the user table to prevent duplicate ssns for all users. 

### Shards

the value that a $path "points to" is called a "shard" for short - it is a subvalue ($branch) of a larger forest.

## Observable attributes

### `value: <DataType>`

Value is the latest $broadcast state of the forest; like BehaviorSubjects the value
is always present and conforms to the $schema and (hopefully) the generator type of the forest.

**IMPORTANT: The value property is read-only and immutable.** You cannot directly assign to it
or modify it in place. To change the forest's value, you must use `mutate()`, `set()`,
or `next()` methods.

### `subscribe(listener: Listener): Subscription`

Subscribe provides obseverable functionality. Unlike "dumb Subjects" that
automatically broacast every time next is called, Forestry puts validation criteria
between a _candidate_ and an observable _change_ to the current value of the forest.

Also only _meaningful_ change is $broadcast via the distinct filters

### `next(candidate: DataType)`

submits a candidate for updating the forest. After validation, broadcasts update to all
subscribers.

### `complete()`

freeze the state and prevent updates.

### error(e: Error);

freeze the state and emit an error to all listeners.

### isActive: boolean

Useful for finding out if a forest has been completed/frozen

### `get($path?: Path): any`

Retrieves a value from the forest. If no $path is provided, returns the entire forest value.
If a $path is provided, returns the value at that specific $path within the forest's data structure.

```typescript
const userForest = new Forest({
  value: {
    $name: 'John',
    profile: {
      age: 30,
      settings: {
        theme: 'dark'
      }
    },
    tags: ['developer', 'typescript']
  }
});

// Get entire value
const fullData = userForest.get();
// Returns: { $name: 'John', profile: { age: 30, settings: { theme: 'dark' } }, tags: ['developer', 'typescript'] }

// Get nested value using string $path
const theme = userForest.get('profile.settings.theme');
// Returns: 'dark'

// Get nested value using array $path
const age = userForest.get(['profile', 'age']);
// Returns: 30

// Get array element
const firstTag = userForest.get(['tags', 0]);
// Returns: 'developer'
```

### `mutate(producerFn: (draft: any) => void, $path?: Path): any`

Safely mutates the forest's value using Immer. The producer function receives a draft that you can modify directly.
If no $path is provided, the producer function operates on the entire forest value.
If a $path is provided, the producer function operates only on the value at that $path.

```typescript
const userForest = new Forest({
  value: {
    name: 'John',
    profile: {
      age: 30,
      settings: {
        theme: 'dark'
      }
    },
    tags: ['developer']
  }
});

// Mutate entire forest
userForest.mutate(draft => {
  draft.name = 'Jane';
  draft.profile.age = 25;
  draft.tags.push('react');
});
// Forest value is now: { name: 'Jane', profile: { age: 25, settings: { theme: 'dark' } }, tags: ['developer', 'react'] }

// Mutate specific $path - update profile only
userForest.mutate(draft => {
  draft.age = 26;
  draft.settings.theme = 'light';
}, 'profile');
// Only the profile object is modified: { age: 26, settings: { theme: 'light' } }

// Mutate array at specific $path
userForest.mutate(draft => {
  draft.push('vue');
}, 'tags');
// Adds 'vue' to the tags array
```

## Subclassing Forest and ForestBranch

Instead of defining actions in constructor parameters, you create custom classes by extending `Forest` or `ForestBranch`.
This provides better TypeScript support, clearer APIs, and more familiar object-oriented patterns.

### Basic Counter Example

```typescript
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

class CounterForest extends Forest<number> {
  constructor(initialValue: number = 0) {
    super({
      value: initialValue,
      schema: z.number(),
      name: 'counter'
    });
  }

  increment() {
    this.next(this.value + 1);
  }

  decrement() {
    this.next(this.value - 1);
  }

  add(amount: number) {
    if (typeof amount !== 'number') {
      throw new Error('Amount must be a number');
    }
    this.next(this.value + amount);
  }

  reset() {
    this.next(0);
  }
}

// Usage
const counter = new CounterForest(5);
counter.increment(); // value is now 6
counter.add(4);      // value is now 10
counter.reset();     // value is now 0
```

### Shopping Cart Example

```typescript
interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface ShoppingCart {
  items: CartItem[];
  total: number;
}

class ShoppingCartForest extends Forest<ShoppingCart> {
  constructor() {
    super({
      value: { items: [], total: 0 },
      schema: z.object({
        items: z.array(z.object({
          productId: z.string(),
          quantity: z.number().positive(),
          price: z.number().positive()
        })),
        total: z.number().min(0)
      }),
      name: 'shopping-cart'
    });
  }

  addItem(productId: string, quantity: number, price: number) {
    this.mutate(draft => {
      const existingItem = draft.items.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        draft.items.push({ productId, quantity, price });
      }
      this.updateTotal(draft);
    });
  }

  removeItem(productId: string) {
    this.mutate(draft => {
      draft.items = draft.items.filter(item => item.productId !== productId);
      this.updateTotal(draft);
    });
  }

  updateQuantity(productId: string, quantity: number) {
    this.mutate(draft => {
      const item = draft.items.find(item => item.productId === productId);
      if (item) {
        if (quantity <= 0) {
          draft.items = draft.items.filter(item => item.productId !== productId);
        } else {
          item.quantity = quantity;
        }
        this.updateTotal(draft);
      }
    });
  }

  clearCart() {
    this.next({ items: [], total: 0 });
  }

  private updateTotal(draft: ShoppingCart) {
    draft.total = draft.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }
}
```

### Using Custom Subclasses with Branches

You can create custom ForestBranch subclasses and use them when creating branches:

```typescript
import { ForestBranch } from '@wonderlandlabs/forestry4';

interface UserProfile {
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

class UserProfileBranch extends ForestBranch<UserProfile> {
  updateName(name: string) {
    this.mutate(draft => {
      draft.name = name;
    });
  }

  updateEmail(email: string) {
    this.mutate(draft => {
      draft.email = email;
    });
  }

  toggleTheme() {
    this.mutate(draft => {
      draft.preferences.theme = draft.preferences.theme === 'light' ? 'dark' : 'light';
    });
  }

  toggleNotifications() {
    this.mutate(draft => {
      draft.preferences.notifications = !draft.preferences.notifications;
    });
  }
}

// Usage with main forest
const appForest = new Forest({
  value: {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      preferences: { theme: 'light', notifications: true }
    }
  }
});

// Create a branch using the custom subclass
const userBranch = appForest.$branch<UserProfile, UserProfileBranch>(['user'], {
  subclass: UserProfileBranch
});

// Now you can use the custom methods
userBranch.updateName('Jane Doe');
userBranch.toggleTheme();
userBranch.toggleNotifications();
```

### Action Return Values

Actions can return values - but they don't have to. If they do its is a good idea to define the Actions 
interface of your actions to maintain type safety. 

Actions may change the value of its $subject, and may even do so multiple times. All changes are $broadcast at the 
completion of each action. 

### Errors and Rollbacks

Any uncaught validation errors are thrown and cause state to "rollback" to the last good version; this will
_not_ terminate the store but will suspend all changes unless an enclosing action contains and catches the error. 

(more on this later)

### Termination of forests

You can manually cause a forest to terminate with an error on a deal-breaking error yourself
by calling `forest.error('failed apis')`;
this will suspend future changes and make the forest _inactive_ (`forest.isActive = false);
next() calls will cause an error.

ForestBranches may be terminated without terminating the $root forest. You can for instance create two branches
from the same $path and terminate one, but the other will still be active, as will the forest that created them.

### Action resolution and subscriptions

Subscriptions only $broadcast on the completion of all actions; the values are updated in the forest,
but the user only gets an update at the completion of the outermost action. This is to reduce listener
overload. Also, only unique values are emitted; so in the above code, `counter.$.loop()` doesn't $broadcast
because the end value is the same as the original counter number.

### `actions|$`

User defined methods for selecting values and/or updating state

### `actions: Map<string, ActionExposedFn> | Record<string, ActionExposedFn> `

The input change functions that are the basis for actions/$

## Validation and Schema

Validation and Schema $validate all store candidates before it is submitted.
Schema is a special criteria powered by Zod that ensures the candidates
conform to a specific pattern; essentially type gates; as the store is dynamic,
Zod provides the template of conformation.

All validation is optional but useful for maintaining quality data.

### $schema: Map<Path, Zod> | Zod

you can define $schema for a $path or class of paths or just simply for the entire
store value. you can use Zod to $validate basic types (`z.string()` or `z.array()`).

note - the actual interface of a $schema is that which has a parse(value) method that throws when the argument 
fails to meet expectations; Zod or ZodMini is recommended but any object with that signature can be used
to define your $schema if you have another pre-existing $schema system in your code base (eg Yup), just 
create a scaffold around it via an object with a parse method. 

### `tests: ValueTestFn[] | ValueTestFn 

you can define tests(validators) for a $path or class of paths or just simply for the entire
store value. Validator Functions take a value as their first parameter and have access to the 
store instance via `this`, allowing you to compare the candidate value with the current store state.

ValidatorFn's are functions that return a falsy value / void if the value is correct,
and an error string / thrown error if the value fails to pass muster.

You can $test the validity of an element or a shard with the `mystore.$isValid(value)`

tests can be a single function or an array of functions; in the latter case they are run in order; 
any failed $test will short circuit the series so you can trust the prior $test succeeded; eg, 
in the below example, you can trust the input to the second function is a string due to the first $test.

```javascript
{
  tests: [
    function(value: unknown) { 
      return typeof value === 'string' ? null : 'must be string'; 
    },
    function(value: unknown) { 
      const str = value as string;
      return /^[\d]{3}-[\d]{4}-[\d]{4}$/.$test(str) ? null : 'invalid phone format';
    }
  ]
}
```

Test functions can also access the store via `this` to compare with current state:

```javascript
{
  tests: function(value: unknown) {
    if (typeof value !== 'number') return 'must be number';
    if (value < 0) return 'must be positive';
    if (value > this.value * 2) return 'cannot more than double current value';
    return null;
  }
}
```
#### Usage Note 
Tests are not for type validation - that should be covered using Zod as `$schema`.
it is for things like validating strings against regex, or that each item in an array param is unique,
or other "business criteria" that type/$schema checks cannot facilitate. Also you can define custom error 
messages for multiple checks in tests, so you can get more specific information as to why a value failed validation. 

the $schema $test executes before the tests, so you can trust any input to a $test has passed the $schema
parse $test (if it exists); conversely you _cannot_ trust that the tests have passed before the $schema.parse() 
method is called. 

###

### `$validate(value) : {$isValid: boolean, error?: Error}`, `$isValid(value) : boolean`
if you want to check a value for validity without throwing both these methods  check the tests and $schema
against a candidate and return feedback without throwing. $isValid returns a simple boolean; $validate 
returns a structure containing the failure if you want to know why the value is not valid.
(and yes, $isValid is just a wrapper for $validate)

## Mutation Helpers

### `set(candidate: any, $path?: $path)`

updates a part of the value and submits the new candidate as next; if $path is absent,
is identical to next.
The $path if present cannot be dynamic (with glob or regex elements).

set may accept a $path with one extra field on a complex target. That is it will
add a field to an object, an element to an array or a key / value pair to a Map. 
however it cannot accept a multiply unset field eg 'foo.bar' because it cannot infer
the desired form of foo from context before adding bar to it. That will create a thrown error. 

The one exception is the '+' subpath - you can push() an value to an array or set with a '+',

### `get<Type>( $path: $path, count?: number | true = 1): Type | Type[] | undefined`

Gets a value from the store. returns undefined if the $path has no solution.
note - if the $path is dynamic (has a glob or regex) the first matching candidate is found;

* if a number is passed as the second argument, _that many_ results will be returned.
* if `true` is passed as a second argument, _all_ results will be returned

## Factories

Factory functions contain sub-stores for managing part of the $root stores' values.

### `$branch<DataType, Actions>($path: Path, params: Omit<StoreParams<DataType, Actions>, 'value'>): ForestBranch<DataType, Actions>`

Makes a store out of a shard of the current Store; when the value of the store changes, it updates
the $parent store's value -- and vice versa. In this way the main Forest can act as a "database" and
you can have ORM style branches for tables and records (or even more granular fields etc.) to
focus on a specific subsection of the store and apply methods with a more focused "this" and value.

The `params` object can include:
- `subclass`: Custom ForestBranch subclass - Your custom branch class with methods
- `schema`: ZodSchema - Validation schema for the branch data
- `tests`: ValueTestFn or ValueTestFn[] - Custom validation functions
- `name`: string - Optional name for the branch (auto-generated if not provided)

Example using a custom subclass:
```typescript
interface ShoppingCart {
  userId: string;
  items: Array<{ productId: string; quantity: number; }>;
}

class ShoppingCartBranch extends Forest<ShoppingCart> {
  addItem(productId: string, quantity: number = 1) {
    this.mutate(draft => {
      const existingItem = draft.items.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        draft.items.push({ productId, quantity });
      }
    });
  }

  clearCart() {
    this.mutate(draft => {
      draft.items = [];
    });
  }
}

const cartBranch = forest.$branch<ShoppingCart, ShoppingCartBranch>(['shoppingCart'], {
  subclass: ShoppingCartBranch,
  schema: z.object({
    userId: z.string(),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().positive()
    }))
  }),
  tests: (cart) => {
    if (cart.items.length > 100) return 'Cart cannot exceed 100 items';
    return null;
  }
});

// Now you can use the custom methods
cartBranch.addItem('product-123', 2);
cartBranch.clearCart();
```

### `transaction<SubDataType>((Store<subDataType>) => void, $path: Path?: actions?: ActionMethodRecordIF>`

Transactions copy the store value into a detached tree/store, passes it to a mutator, 
and barring thrown errors, copies its value to the $parent store upon completion.

During execution of the store all validation in the $parent context is suspended.
This is useful for conducting operations in which invalid states may be temporarily
reached. note - in the unlikely event you subscribe to store, every change will be emitted,
so there is a likelihood that temporarily invalid valuse may be passed to a subscriber.

On completion of the enclosing function the store os completed/ not active so do not
attempt to reference the temporary store from outside variables; it won't be usfel after the function runs

The mutator is synchronous. During execution of a transaction all $parent changes are delayed
until the transaction is competed; due to the un-threaded nature of JS this is not
likely to be a problem but any change queued during a transactions lifetime will be lost
if the transaction fails. Any async actions called inside a transaction mutator have un-predictable
results but will most likely fail as the $subject will be locked post-mutation.

# Branches and Forests

A forest is a "Root store" with no $parent or rootPath but conforms in all other
ways to the Store interface.

## Forest-specific Methods

In addition to all Store methods, Forest provides additional methods for managing nested data:

### `set($path: Path, value: unknown): boolean`

Sets a value at a specific $path within the Forest's data structure. This is a convenience method
that uses Immer internally to safely update nested values.

```javascript
const forest = new Forest({
  value: {
    user: {
      $name: 'John',
      profile: {
        age: 30,
        settings: {
          theme: 'dark'
        }
      }
    },
    config: {
      debug: false
    }
  }
});

// Set a nested value using string $path
forest.set('user.profile.age', 31);
// Updates only the age: { user: { $name: 'John', profile: { age: 31, settings: { theme: 'dark' } } }, config: { debug: false } }

// Set a nested value using array $path
forest.set(['user', 'profile', 'settings', 'theme'], 'light');
// Updates only the theme: theme is now 'light'

// Set a top-level value
forest.set('config.debug', true);
// Updates only the debug flag: debug is now true

// Returns true if successful, throws error if validation fails
const success = forest.set('user.$name', 'Jane'); // returns true
```

A ForestBranch is a client of the Forest that represents a sub-part of the forest such as a sub-record or sub-field.
ForestBranches maintain reactive connections to their $parent Forest, automatically updating when the $parent changes
and propagating their own changes back to the $parent.

## Transactions and Branches and Forests

Transactions defer ALL changes ACROSS THE BOARD to the forest even sibling ForestBranches or sub-branches.
They establish consistent changes at the potential loss of a bit of performance.

## Branches / paths are _optional_

Putting all your data in the $root and only having a single, shallow state is
_perfectly fine_ - branches and pathing are advanced features that you don't need to
use Forestry 4.0. Thus $schema and validators can be defined using a complex pathing
scheme OR can be simple $root value Zod items and ValidatorFn instances.

## ForestBranch Features

ForestBranches provide several advantages over working directly with the root Forest:

1. **Focused Interface**: Each branch exposes only the data and methods relevant to its specific domain
2. **Type Safety**: Full TypeScript support with proper typing for both data and custom methods
3. **Reactive Updates**: Automatic synchronization with parent Forest changes
4. **Validation**: Branch-specific schema and test validation
5. **Nested Branching**: Branches can create their own sub-branches for further organization

## Migration from Action-Based to Subclassing Approach

**Forestry 4.0 has undergone a major architectural change.** Instead of defining actions in constructor parameters, you now create custom subclasses of `Forest` and `ForestBranch` with your own methods.

### Before (Action-Based)
```typescript
const store = new Forest({
  value: { count: 0 },
  actions: {
    increment: (value) => ({ ...value, count: value.count + 1 }),
    add: (value, amount) => ({ ...value, count: value.count + amount })
  }
});

store.$.increment(); // Called via .$ property
store.acts.add(5);   // Called via .acts property
```

### After (Subclassing)
```typescript
class CounterForest extends Forest<{ count: number }> {
  constructor() {
    super({ value: { count: 0 } });
  }

  increment() {
    this.mutate(draft => {
      draft.count += 1;
    });
  }

  add(amount: number) {
    this.mutate(draft => {
      draft.count += amount;
    });
  }
}

const store = new CounterForest();
store.increment(); // Called directly on instance
store.add(5);      // Called directly on instance
```

### Benefits of Subclassing Approach

1. **Direct Method Calls**: No more `.$ ` or `.acts` - call methods directly on instances
2. **Better TypeScript Support**: Full type safety and IntelliSense for custom methods
3. **Cleaner Architecture**: Methods are part of the class definition, not configuration
4. **Easier Testing**: Test methods directly without action transformation complexity
5. **Better Inheritance**: Extend classes naturally with standard OOP patterns

### Branch Subclassing
```typescript
class ShoppingCartBranch extends Forest<ShoppingCart> {
  addItem(productId: string, quantity: number) {
    this.mutate(draft => {
      const existing = draft.items.find(item => item.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        draft.items.push({ productId, quantity });
      }
    });
  }
}

// Use with $branch method
const cartBranch = forest.$branch<ShoppingCart, ShoppingCartBranch>(['cart'], {
  subclass: ShoppingCartBranch
});

cartBranch.addItem('product-123', 2); // Direct method call
```

## License

MIT