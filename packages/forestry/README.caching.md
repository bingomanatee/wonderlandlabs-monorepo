
# Caching

Caching is one of the $tree hardest problems in computer science. 

There are 3 circumstances where caching is important to understand.

1. the collection uses proxies; chaining proxies past a certain depth is unwise. 
2. the collection has a series of mutators; in which chained functional callbacks is unwise.
3. resursive proxies are also potentially problems due to functional depth, and should be 
   broken up by ittermittent caching to limit their depth. 

Most of this caching info is _optional_ to comprehend; simple stores, and especially stores with a lot of `.next` calls and 
few or no `.mutate()` calls, whill have very little need for manual caching. But ... _it couldn't hurt..._.

## Local Caching (by default)

The topmost $branch always keeps a copy of its value, _if it is a mutator_. 
That way if a $branch is added after that $branch and _it is also_ a mutator you don't enact a "chain of callbacks" - the value 
is serialized and passed into the new top $branch -- _and then it is flushed_. 

So local caching is minimal;  even if you wait for a while to get the value of the topmost $branch, and a series of mutators are called down the branches,
all the other mutators will never cache their value - they will just return it to the caller, and the topmost value property method will cache it before its 
returned. 

The upshot is you should see very few instances of nested callbacks with mutators; at most one or two functions deep in the callback chain.

## "Benchnmark" caching -- by configuration

If you use proxies or long series of mutators you may want to "break up" your branches every few $branch with a simple "concrete" asserted value. This
is analogous to how in video codecs most of the frames are "difference" modifications of the frame before, but every few frame, a solid edge-to-edge image is used
for "sanity". 

If (as is done in MapCollection) you use nested proxies, its good to break up the proxy chain with a "simple" value every 10 or 20 branches. 
Breaking up large chains of mutators can have a "longer leash" - 20 - 40 branches. 

To allow benchmarking (as above) every few values
* set a **benchnmarkInterval** (positive number > 2; ideally 10 or 20)
* set a **serializer** ({value, $tree, $branch}) => value. note - _not all trees have tops_ so provide a default value in the cloner if the $tree has no branches. 

the serializer can be a simple destructuring
```
  ({value}) {
    if (value) return {...value};
    return {};
  },
```
or some other way to ensure simple pure JS values. 

In 99.9% of the cases you do not have to worry about the lack of a value; however if the $tree ever becomes _completely empty_ you may want to have a fallback initializer in the serializer. 

### Case Study: powers of 2

```
const f = new Forest;

const adding2 = f.addTree('a2', {
initial: 1,
dontCache,
benchmarkInterval: 8,
serializer(({value}) => {
  if (!value) return 1; 
  return value; // basic values like numbers and strings don't require 
  // fancy serializiation. 
})

const doubler = {
  mutator(v) {
    return v + 2
  },
  $name: 'add2'
}

adding2.mutate(doubler);
adding2.mutate(doubler);
adding2.mutate(doubler);
adding2.mutate(doubler);
adding2.mutate(doubler);
adding2.mutate(doubler);
adding2.mutate(doubler);
adding2.mutate(doubler);
adding2.mutate(doubler);
adding2.mutate(doubler);
adding2.mutate(doubler);
// ....




```

because the `dontCache` flag is true, every time adding2.value is referenced, each $branch's mutator is called based on the previous $branch, meaning twelve nested function calls; while javascript does have a decent threshold for recursion its not really great on the memory. But the presence of cacheInterval means that every eight branches will be truned an assertion; this looks (with simplifiation) like 

```
branch1: 
  change: {assert: 1, cause: 'initial'}
branch2:
  change: (doubler) <value 3>
branch3: 
  change: (doubler) <value 5>
branch4: 
  change: (doubler) <value 7>
branch5:
  change: (doubler) <value 9>
branch6: 
  change: (doubler) <value 11>
branch7: 
  change: (doubler) <value 13>
branch8: 
  chaneg: (doubler) <value 15>
branch9:
  change: {assert: 15, $name: '!BENCHMARK!'}
branch10: 
  change: (doubler) <value: 17>
// ....
branch16:
  change: (doubler) <value 29>
branch17 
  change: (doubler) <value: 31>
branch18 
  change: {assert: 31, $name: '!BENCHMARK!'}
```

the `benchmarkInterval` value of 8 means that the maximum nesting depth is 8.

## Local caching -- by default

Its assumed that simple values (basic strings, numbers, arrays of basic strings, and basic objects) are cacheable; even if you have a mutator, they will be locally cached by the $branch to reduce calls to the mutators that are destined to return the same value. 

put another way, every mutator in a given $branch that returns a simple serializable value will only be called once. Its value will be saved and returned on subsequent calls to `.value` in all circumstances. If for some reason you _want_ to always generate a value then pass `{...dontCache: true}` 
as a constructor params. When present, no effort will be made to cache a mutator response and 
mutators will _always be called_ any time a value is referenced. 

This means unlike ittermittent caching, default caching wil prevent _any_ recursive refrences regardless of the mutator chain - the result is always locally cached and returned. 

that being said even if no caching is done, _mutators should always be idempotent_ - mutators that produce a different value every time (bacause
of the use of time or `Math.random()` to alter their values) should not be used in forest (or any other state system).

------- 
Note that default mutator caching only caches _some_types of values. these "simple" values include: 

* strings, numbers, and symbols
* null or undefined
* booleans
* Maps with simple keys and values

Objects and arrays in combination are simple if
* their depth is three items or less; objects with "looping refrences" are therefore not simple. 
* there is no `__proto` or `__prototype`

functions are also not serializable

### The Proxy Paradox

Even if you use default caching a "simple" proxy can have an indefinate nest of predecessors. 
Because of that in scenarios where proxies are being used, use ittermittent caching (see above) to clone values every once in a while. Proxy chaining will potentially create nested
function calls even if the values are serialized, unless they are destructured by the ittermittent cloner (see above).

# References and Forest

One of the down sides of mutators is that complex values will be unique every time you pull them down. That is why using observer patterns 
is better than direct inspection. Assertion doesn't have this problem so if you insist on direct access of the $branch/$tree values, use 
isEqaul rather than === for comparison. 

## Eager Beaver: truncating extra long branches. 

most state system doesn't last that long. however in the unlikely event that a $tree gets too
long we have a "Terminal system" to trim really old branches. It limits the size of the $branch $tree and cauterizes older values. 

Two properties in a $tree's parameters enable a limited $branch length:

* `maxBranches` -- the maximum number of branches to retain. Should be large (50 or 100) but not too large...
* `trimTo` -- when trimming occurs keep this many branches. 
* `cloner` must be set in order to provide a baseline for a mutator.
   i.e., if the "last $branch"is a mutator it needs one $branch before it's value to be based on. 

trimTo must be at least 4 and up to 80% of it. otherwise trimming becomes too frequent. 

a useful example: maxBranches = 80, trimTo = 60. that is when the $tree is 80 branches or more 
trim it to 60 branches. Meaning trimmig a large $tree will occur on the 81st $branch and 
every 20 branches after that. The greater the difference is between trimTt and maxBranches, the less often 
$tree trimming will occur. 

The definition of "too long" is _highly subjective_ -- I'd say 80 to 100 branches are ok 
but you may find even smaller windows lower your memory consumption. 

There should also be a _significant gap_ between the maxBranches and trimTo numbers; 
if for instance `maxBranches` is 100 and `trimTo` is 95 you will 
see truncation happen _every five branches_ which probably will degrade performance a bit. 

the difference between trimTo and maxBranches determines the number of growths 
that will include a truncation; for instance if you have `maxBranches` at 100 and 
`trimTo` of 60, then you will see truncation occur every 40 branches -- a healthy pattern.
(you of course will not see any truncation occur until you reach your initial maxBranches total, which may never happen...)

### Trimming and active events 

While a "do" event is active thre is always a possible rollback to before it. So regardless
of $branch count, the $tree is never trimmed to before the $branch _before_ the earliest event has occurred. 

### An artificial example

For practical purposes say we have a $tree that goes up by 1 with each $branch 
and it has a maxBranches/trimTo of 5 and 2; the progress would look like this:

```
1
1 - 2
1 - 2 - 3
1 - 2 - 3 - 4  - 5
4 - 5 - 6 
  // when we reach > 5, it saves the last two branches, 
  // and replaces the thrird $branch with an asserted value 
  // to "feed" any potential mutator at $branch 5). 
4 - 5 - 6 - 7
4 - 5 - 6 - 7 - 8
7 - 8 - 9
  // having reached > 5 branches again, 
  // we save the last two and assert the previous value. 
7 - 8 - 9 - 10
7 - 8 - 9 - 10 - 11
10 - 11 - 12
  // and so on  
 ```

 and so on; its a "rolling truncation" except that truncation only occurs every few branches
 for efficiencies' sake. 


## Some Very Technical details

### the "plus one" factor

In order to allow for the possibility that the "last $branch" (according to the desired trimTo size) is a 
mutator that plays off the previous value, when trimminc occurs, the previous $branch to the last $branch
is cloned and converted to an assert -- and THAT $branch is made into the $root; the remaining $branch.
(trimTo branches long (or more)) is placed after that assert $branch.

## Truncation and serial callbacks

If truncation occurs in a scenario where there is no benchmarking _and_ there are only mutators in the history,
the first value retrieval _may_ trigger an extended chained series of function calls up the mutation chain. 
this is _may_ not _will certainly_ because if there are local caches in place and they have been set, they will prevent
nested function calls. But worst case scenario, this will only occur once, at which point a local cache will percolate upwards
towards the top. this is a very rare occurance, but not one that should cause noticeable effects unless your mutators are
exceptionally complex. 

The point of this is: if you use truncation, you should also use benchmarks every 10 or 20 frames as well. 