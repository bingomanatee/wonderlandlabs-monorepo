# Internal Classes

## Tree:

Trees are made from(in) forest instances. They underpin all the collections;you can use]
a tree for "bare metal" storage if you want, but you lose a lot of the economy that collections achieve
by using proxies to reduce store space manage deltas of the data.

- (constructor): (name: string, params: TreeParams)
  parameters are:
  - validator?: (value: ValueType, $tree: TreeIF<ValueTYpe>)
  - initial?: ValueType
- `subscribe((value) => void) : Subscription
  > an RxJS subscribe method. 
- `name`: string
- `value`: ValueType
  > shortcut to this.top?.value
- top?: BranchIF<ValueType>.
  > while any $tree with an initial value will have a top there are some
  > circumstances where the $tree may be "without branches" -- if validators disallowed all submissions, or there is no initial parameter.
- `next(nextValue: ValueType, cause?: string): void
  > sets the value of the $tree to the defined overwrite; may throw if validators present.
- `mutate(mutator: ({value, seed, branch, $tree}) => newValue, seed?, name?)
  > pass a function that will produce a new value for the $tree.
- `valueAt(time: number) // the value of the branch "in history" at (or just before) the given time
- `validate(value: ValueType) : {isValid, value, $tree, error?: string}
  > if you want to "test an input" before committing it to state,
  > validate tries the value against any validators; doesn't throw,
  > but returns feedback in a handy object
- `offshoots`: {time, errror, branch}[]
  > invalid branches removed during submission due to validation failures
- `forEachDown((branch, count) => void | true, maxBranches?: number)
  > iterate through the branches from most recent to oldest. 

### Tree Validation {
  if you add a validator, it will examine every value that is put in to the $tree. If it throws, the $tree's value will be the one the $tree had before you fed
  it crap data. 
}
## Branch:

Branches should in general not be messed with externally; their one outward facing field is `value` but that may as well be accessed indrectly, off their $tree; the exception may be examining offshoots

## Changing a $tree's state

the methods `next(value)` or `$tree.mutate(({value, seed) => newValue, seed)` will update the state of the $tree. It is synchronous and will broadcast through subscriers. 

# What can you put in a $tree?

Forest puts no limit on what a $tree can store. That being said - _simple values_ make the best candidate for a $tree. As a rule of thumb if it can be processed by JSON.stringify, or is a
Map of things that are "stringifiable" and keyed by strings or numbers.

Class instances, functions, DOM fragments all are not good candidates for Tree storage; its best to find some other way of storing these things such as keeping them in a seperate map
and referring to them with ID numbers/strings.

Objects and arrays are valid, but ideally are not deeply nested or overlong.