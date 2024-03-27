# @wonderlandlabs/forest 3.x

Forest is a long-used state system; forest 3 attempts to adjust behavior for controlled
components as well as establishing an explicit "sandbox" (Forest) and a broader
and more diverse state type with explicit "Branch" and "Leaf" classes.

* "Branch" is a structured state that is an object or map with one or more
  fields (leafs) and/or children (branches).
* "Leaf" is a scalar state which has no children.

## Leafs

Leaf represents a configuration for a scalar value, such as a form field.
It _may_ have any of the following

* A `type` defining what kind of value it can have
* `options` (like enum values) expressing the absolute values that value can be
* a `test` function or regex
* a `filter` function that cleans up any candidates before they are stored.
* a `strict` boolean; if false, it will _accept_ bad values (that fail the above guards)
  but will express failures in the `.errors` array.
* `required` boolean; if false, will accept falsy values that don't pass its tests.

## Branches

Branches are Leafs that are container types (object or map) whose fields are
defined by zero or more leafs. They may also have child Branches whose value is combined
into one of their fields.

Branches' types are defined implicitly by their $value's type OR are defined by config.
Branches _may not accept_ a value whose type does not match their original type.

Branches are stored in / created from a Forest instance.

## Trees (@TODO)

Trees are Lists (Arrays or Sets) of things whose configuration is an extension
of the shared branch configuration used in the Trees initial configuration.
(I.e., they are collections of like objects)

## Common properties

All structures created and maintained by a Forest (Branches, Leaves, Lists) have a few properties in common:

* `name` -- the name of the state
* `value` -- the content being observed
* `do` -- the actions that can mutate the value
* `$` -- selectors - computations based on their value

Some optional properties include:

* `parent` - the Branch containing the Branch/Leaf
* `errors` - an array of test/violations of the Branch/Leaf
* `deepErrors` - the errors of the Branch and any errors of children
