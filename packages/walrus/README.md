# WALRUS

Walrus is a medley of utilities I keep on needing or using, so here I am centralizing
them for consistency.

## Text functions

### addBefore/addAfter(base: string, append: string) : string

Routines for ensuring or removing a phrase (such asd a domain) in front of or after a string

### humanize (phrase: string) => string

This is for "breaking up" parameters or SQL fields into sentence form by replacing "\_-" with
single spaces

### ucFirst (phrase: string) => string

Replaces the first letter in a string with an uppercase character

### entitle (phrase: string) => string

This is a blend of humanize and ucFirst; it splits strings into sentence form then
capitalizes each word.

## Type functions: describe (value: any) => TypeDef

The 'typeof' paradigm is too coarse for some purposes and too broad for others. While
Typescript does a good job of static checking, many times, values are not fixed at design
time, so it's good to know precisely what they are at runtime.

The main utility of the type library is describe(value) which takes in any value
and returns a TypeDef describer.

The primary reason for this utility is that there are a lot of "overlapping" types in
javascript: null, array, and POJOs are all objects, as are Sets and Maps. But also there
are times when you want to know whether an item is in a specific category (such as "scalar")
without caring about whether it is an integer or string. Or for example, there is a collective family of "void"
that encompasses undefined and null.

Here are some examples of how native typings can in some contexts either be too broad or too narrow,
requiring repeated boilerplating:

- there are two "voidy" types, undefined and null that are functionally identical 99% of the time
- there is no native definition of 'scalar' types
- there is no native differentiation between integer and float numeric types
- the overlap between null and object, and object and array, requires repeated boilerplate

Here is the complete matrix of describe outputs depending on whether you query the "form", "family" or "type"
of the output:

## Possible TypeDef outputs of `type.describe(value)`, by example input

| example                        | type               | form              | family             | typeOf      |
| ------------------------------ | ------------------ | ----------------- | ------------------ | ----------- |
| undefined                      | TypeEnum.undefined | FormEnum.void     | FormEnum.void      | 'undefined' |
| null                           | TypeEnum.null      | FormEnum.void     | FormEnum.void      | 'object'    |
| false                          | TypeEnum.boolean   | FormEnum.scalar   | FormEnum.scalar    | 'boolean'   |
| 'Oddity'                       | TypeEnum.string    | FormEnum.scalar   | FormEnum.scalar    | 'string'    |
| 2001                           | TypeEnum.number    | FormEnum.scalar   | FormEnum.scalar    | 'number'    |
| Symbol('loaded')               | TypeEnum.symbol    | FormEnum.scalar   | FormEnum.scalar    | 'symbol'    |
| function(){} / () => {}        | TypeEnum.function  | FormEnum.function | FormEnum.function  | 'function'  |
| `[1, 2, 3]`                    | TypeEnum.array     | FormEnum.array    | FormEnum.container | 'object'    |
| `new Map(['x', 1'], ['y', 2])` | TypeEnum.map       | FormEnum.map      | FormEnum.container | 'object'    |
| `new Set(['a', 3, false])`     | TypeEnum.set       | FormEnum.set      | FormEnum.container | 'object'    |
| {a: 1, b: 2}                   | TypeEnum.object    | FormEnum.object   | FormEnum.container | 'object'    |

type in one call gives you a definitive unique type assignation for any value;

TypeDef -- the return value from describe -- has the following signature:

```

{
type: string
typeOf: string  // note the camelCased "typeOf"
form: string
family: string
}

```

- **type** is the richest descriptor; it includes the set 'string','number','boolean','symbol','array','map','object','set','null','undefined','function'
- **typeOf** is exactly the same result as the `typeof` operator
- **form** compresses all the scalar types into the descriptor 'scalar' and undefined and null are both considered 'void'
- **family** considers all the advanced types (array, Map) to be 'container' So it has one of three values: 'scalar', 'container', 'void'.

you can extract the type of the typedef (to a string) by passing `true` to the second argument, or
you can extract a named field by passing it as a string.

**Examples:**

```
type.describe(null) =  {"type":"null","form":"void","typeOf":"object"}
type.describe(3) =  {"type":"number","form":"scalar","typeOf":"number"}
type.describe([]) =  {"type":"array","form":"array","typeOf":"object"}

// passing 'true' is the eqivalent of passing 'type' as the selector

type.describe(null, true) =  "null"
type.describe(3, true) =  "number"
type.describe([], true) =  "array"

type.describe(null, "family") =  "void"
type.describe(3, "family") =  "scalar"
type.describe([], "family") =  "container"
```

### describeNumber (value) => string

returns one of a possible value describing a (potentially) numeric value in detail: 'integer','decimal','infinite','nan'.
note that 'nan' includes both the "classic" nan result for math results and all other non-numeric types.

### Why would we want this if we have typescript?

while you could define container and scalar types you still would have to write some fairly complex type guards to enforce them.
the describe method is useful in writing cleaner type guards; for instance instead of constantly having to assert
`arg && typeof arg === 'object' && !Array.isArray(arg)` in your typeguards, you can simply assert
`type.describe(arg, true) ==== TypeInum.object` and be assured that the input is truly an object type and not one of the many
quasi-object variations like Sets or Maps.
