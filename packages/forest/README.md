# @wonderlandlabs/forest 3.x

Forest is a long-used state system; forest 3 attempts to adjust behavior for controlled
components as well as establishing an explicit "sandbox" (Forest) and a broader
and more diverse state type with explicit "Branch" and "Leaf" classes.

* "Branch" is a structured state that is an object or map with one or more
  fields (leafs) and/or children (branches).
* "Leaf" is a schema definition for a branches' fields.
* "Tree" (TODO) is a collection of homogenous data, similar to a Table in a database

## Why all this bother

There is a quality of properties of managed data:

* value and schema
* hierarchical and relational connections
* change operations
* derived values ('selectors') and queries

The OOP model is to a point a fine way of modelling many of these qualities. However,
the way references work in javascript make it difficult to change value and maintain
referential integrity. I.e.,

```javascript
const box = { top: { x: 0, y: 0 }, bottom: { x: 50, y: 100 } };
const { top, bottom } = box;

// THIS CHANGE WORKS:

top.x = -1;

console.log('box is now:', box); // box is now {top: {x: -1, y: 0}, bottom: {x: 50, y: 100}};

// HOWEVER THIS DOES NOT:

box.top = { x: 10, y: 10 };

console.log('box top is now', top); // box top is now {x: -1, y: 10}.
```

That is to say, _direct manipulation of values has unpredictable consequences._ For change to be
predictable, consistent and managed a _scaffold_ is required that synchronizes values in a system
ensuring that the observed values are the same no matter at what point in a network a value is changed.

That is a reason that a database has many mechanics that are far superior to relational links between
content. The mechanics of relational linkage promote errors of inconsistent connections. This is the reason
that the functional paradigm has become powerful: it uses wholesale replacement and immutability to get
around the problems of relationality. However, it does not allow for transactional insulation. This is
where Forest comes in to safeguard entire data systems.

Likewise, the amazing power of views is entirely absent in the world of Javascript. Even the amazing
power of RxDB does not completely coordinate changes in multi-table views.

Lastly: transactional containment of change is absent in all popular systems. That is, its not
possible to enact a series of changes, fail at some point, and roll back those changes; in raw javascript,
change is forever because javascript does not contain a native mechanic to _manage change in time_.

## Branches

Branches are the fundamental unit of Forest. They contain a value of any type.
Branches follow the observable pattern, and have a value which can be read or updated.
The value is defined by the $value property of their configuration.

## Branch Identity

Each branch is defined by an internally defined UUID that is its index in the Forest.
It also has a name. The name of the root branch exists for user convenience. However.
then name of child branches identify the key in which their value is indexed within
their immediate parent.

## Branch Values

A Branch can have _nearly any value_ in Javascript:

* Objects
* Arrays
* Sets
* Numbers
* Strings
* Dates
* Booleans
* null

The only limitation is that as these values may be cloned routinely as they change,
_you cannot store any content that is dependent on its prototype_
(i.e., a class instance or something with static properties/methods).

## Branch Leaves

Leaf represents a configuration for a scalar value, such as a form field.
It _may_ have any of the following

* A `type` defining what kind of value it can have
* `options` (like enum values) expressing the absolute values that value can be
* a `test` function or regex
* a `filter` function that cleans up any candidates before they are stored (or tested)
* a `strict` boolean; if false, it will _accept_ bad values (that fail the above guards)
  but will express failures in the `.errors` array.
* `required` boolean; if false, will accept falsy values that don't pass its tests.

If it is a container type they may contain leaf definitions that define the
schema and possible values of their content; this is the basic way that forms are modeled;
the form is a branch, ann its fields are defined by leaves (with definitions for labels,
value types, etc.).

Branches' types are defined implicitly by their $value's type OR are defined by config.
Branches _may not accept_ a value whose type does not match their type.

Branches are stored in / created from a Forest instance.

### Branch children and parents.

A container (1) Branch may contain child Branches, in an indefinitely deep hierarchy.
If a branch with children is updated its value will percolate downwards.

If you define a child whose value conflicts with the value of the same name of the parent,
the child's value will take precedence.

For instance:

```javascript

const f = new Forest();
const b = f.createBranch({
  $value: { x: -1, y: -1, name: 'Fred' }, name: 'point',
  children: {
    x: { $value: 0, type: 'number' },
    y: { $value: 0, type: 'number' }
  }
});

```

## Update restrictions

You are required to replace any given value of a branch with something of the same value.
However, you aren't required to replace it with a value with the same _properties_.

That is you can't replace an object: `{username: 'fred', password: 'abc123'}` with an array
`['fred', '123']`; however you can replace it with `{id: 100, value: Symbol('fred')}`.
That is you can add or remove properties; if you want tighter restrictions you can do one of
three things:

1. Define leafs which make properties required
2. Create filters that fill out any missing properties before they are updated
3. Create a `test` function in the config which throw errors if the candidate is malformed.

### Updates with children

If you update a Branches value with properties for which the branch has children, the value will
be set to the child branches. They "cascade downwards". Likewise, if you change a child branches'
value directly, the value will percolate downwards to its parent
(and possibly upwards to the "grandchildren").

Cascading changes are atomic. If any child or parent throws a test error, is of the wrong type, or
violates a strict leaf, the entire update will "roll back" and an error will throw.

## Trees (@TODO)

Trees are Lists (Arrays, Maps or Sets) of homogenous things whose configuration is an extension
of the shared branch configuration used in the Trees initial configuration.
(I.e., they are collections of like objects)

## Common properties

All structures created and maintained by a Forest (Branches, Leaves, Trees, Lists) have a few properties in common:

* `name` -- the name of the state
* `value` -- the content being observed
* `do` -- the actions that can mutate the value
* `$` -- selectors - computations based on their value

Some optional properties include:

* `parent` - the Branch containing the Branch/Leaf
* `errors` - an array of test/violations of the Branch/Leaf
* `deepErrors` - the errors of the Branch and any errors of children
* `test` - a function that throws on bad values
* `filter` - a function that pre-processes replacement candidates

## Filters and test functions

the `filter` and `test` properties of Forest items as defined by their config are optional hooks that
are triggered on each change.

**neither of these functions should have side effects** of changing forest items (or anything else).
Specifically its bad process for a filter to alter its input.

These functions both have the same arguments:

- `value`: the candidate update being submitted
- `target`: the Branch that the value is intended to update

* `test` functions throw errors if the next content violates any particular condition. Their return
  value is ignored - throwing error is a test functions only purpose.
* `filter` functions are called before any test functions are triggered. It can return its input (unaltered)
  **_or_** return a new value. It should _not_ alter its input. Typical filter functions

Some typical use cases of tests are:

* Enforcing numeric qualities (integer only, whole/positive only)
* Regex validation of strings
* Limiting or requiring sizes of arrays

Some typical filters include:

* Sorting arrays
* removing banned characters in a string
* "patching" missing fields in an object with default values
* Converting numbers or Dates into string form

### Order of operation

filters trigger before any testing is done. That is, any updates cascade down or up a branch with children
before any testing or validation is done. That is, a "temporary update" occurs within a transactional shield,
then validation begins, and if it fails, all the "temporary update" of the entire network is erased.

(1) container types are values which can (surprise) have other values inside them.

* Objects ('POJOS')
* Maps
* Arrays
* Sets

Set Branches cannot have children as indexing is not really a quality of a sets' content that can be locked down.
