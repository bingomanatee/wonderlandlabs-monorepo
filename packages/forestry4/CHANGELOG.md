# Changelog

## 4.0

- Redesigned Forestry with a slimmer profile.
- Removed the separate "context" forest pattern.
- Moved to one base class for all value types.

## 4.1

- Refactored to class-first usage with class methods instead of the older `$ / act` style.
- Improved type safety and simplified store authoring.

## 4.1.2 - 4.1.4

- Consolidated classes to a single base class: `Forest`.
- Prefixed core Forestry methods with `$` to reduce custom-method collisions.
- Kept RxJS-style subject fields (`value`, `next`, `complete`, etc.) unprefixed.

## 4.1.5 - 4.1.6

- Added `.$` as a bound mirror of class methods for easier React usage.

## 4.1.7 - 4.1.8

- Fixed typing issues and improved `.d.ts` exposure.

## 4.1.9

- Added rest params on branching call: `$branch(path, params, ...rest)`.

## 4.1.12

- Attempted to simplify subject updates to resolve a client bug by reading directly from current
  store content rather than relying on `getPath` during that flow.
- The bug persisted and likely involves map indexing.

## 4.1.13 - 4.1.14

- Added `$branches` / `$br` registry to keep referential child-branch instances.
- Added `branchParams` constructor option to define per-path defaults for branches, including:
  `subclass`, `schema`, `prep`, and other branch options.
- `'*'` in `branchParams` acts as wildcard defaults for unresolved paths.
- `branchClasses` remains supported as legacy shorthand for subclass defaults.
- `$br.$get(path)` lazy-creates a branch when no instance exists and the parent path value is
  defined.
- `$br.$add(path, params)` explicitly creates a branch:
  throws when a branch already exists at the path, and throws when the parent path value is
  `undefined`.
- `$br.get(pathKey)` is lookup-only (no lazy creation).
- `$br.delete(path)` completes and ejects a branch instance from the registry.
- Removed overloaded helpers `$getBranch` and `$removeBranch`; use `$br.get` and `$br.delete`.
