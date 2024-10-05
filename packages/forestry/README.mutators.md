# Mutators

There is two ways to update a branch: 

1. "assert" a concrete value by calling `myTree.next(value)`
2. "mutate" a $tree by passing a function that will change the $tree's value. This can have a second parameter if you want, referred to as the "seed". 

Why would you not just want to cram assertions in? well... if you inject a function and a value, you'll use less memory over time - the value will
come into and through the function and only be cached in the topmost branch. This means even if your store has an extensive history, the only 
thing that will use up storage space is the parameters you pass in. (There are some benchmarking caches that will persist longer if you use ittermittent caching)

In many situations this is not going to be a huge issue but why be wasteful? If you have a long term scenario (say a game) flooding your store with large 
historical memory is not ideal. Say you have a game with a spaceship that can go up, down, left or right and you have a spaceship object 

```
{
    name: 'mySpaceship',
    inventory: ['yams', 'copper', 'alien babes'],
    x: 0,
    y: 0,
}
```

You could move by doing this: 

```

function moveUp($tree: TreeIF<Spaceship>) {
    $tree.next ({...$tree.value, y: $tree.value.y + 1})
}
```
but that would leave a full record of the spaceship in each branch and that is a lot of wasted store. If instead, you called 

```

function moveUp($tree: TreeIF<Spaceship>) {
    $tree.mutate(({value} : {value: Spaceship | undefined }) => {
        if (!value) return makeNewSpaceship();
        return  ({...value, y: value.y + 1})
    })
}
```

then the spaceship is created by returning a variation of the previous branch's value. There is a technical possiblity that
if the mutator is the first branch in the $tree (the "root") there will be no previous value - but if you insure an inital value
in the constructor this doesn't acutally happen.

Is this value cached? "yes but" only the topmost branch keeps a local copy of its output; (more detail in [README.caching.md](./README.caching.md))


## Mutators are lazy 

until the $tree (and its top.value) are retrieved the mutator is not called. So it may _never_ genreate a mutated value, cache locally, 
etc. If you subscribe to the $tree, of course, its value will be called continuously. but if for some reason you do not, it may be some time 
before the value is retrieved and the first time it is, it may take some time. Technically JS can nest thousands of calls, but if this is a concern,
check out itermittent cachinng. This will "bake" a mutator every few branches so the callback queue is never too long. (more detail in [README.caching.md](./README.caching.md))

## The Seed

Sometimes you want to add a parameter to the mutator; in Redux this would be a "payload." `.mutate(mutator, seed, name)` takes an argument 
that you can pass into the mutator, as in 

```

function move ({value, seed} : {value: Spaceship | undefined, seed: Point }) {
        if (!value) return makeNewSpaceship(seed);
        const {x, y} = seed;
        return  ({...value, x: value.x + x, y: value.y + y})
    }

function moveUp($tree: TreeIF<Spaceship>, x, y) {
    $tree.mutate(move, {x, y})
}

```

Your seed will be preserved in the history of branches, so try not to pass seeds which are complex or memory consumptive.

## Naming your mutators

There is an optional third argument, a name string; its optional but if you want more insight into your branches' history you can label the mutator
with a name that is viewable if you iterate  through your $tree with `.forEachUp((branch, count) => {...})` or `.forEachDown(...)`. 

If you name the mutator function as above its name will be used in the logging. 