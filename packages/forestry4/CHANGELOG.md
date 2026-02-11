# Changelog

## 4.0 

redesigned Forestry to hve a slimmer profile; got rid of the "context" forest 
and using one base class for all types of values. 

## 4.1 

Radical refactor - using classes and class methods over the $ / act form for 
much simpler/ better type safe forests

## 4.1.2 .. 4.1.4

Compressing classes to make a single base class (Forest); renaming key methods with 
"$" prefix to make custom functions less intrusive. note - to keep in the RxJS 
pattern for observables Subject fields (value, next, complete...) are not $-prefixed.

## 4.1.5 ..6

Adding $ back as a "bound" mirror of the base class for ease of use in React. 

## 4.1.7..8

Fixed type issues - exposing a d.ts file

## 4.1.9

added rest params on branch. 

## 4.1.12

in an attempt to resolve a bug in a client project simplifying subject - getting new content
directly from the current store instead of with getPath. however -- our content _also_ uses getPath
so the bug persists. May involve map indexing??

## 4.1.13

added a more dynamic $branches / $br subproperty that keeps references to child branches. 
- the new branchClasses constructor property defines the base class for future branches
- the '*' value defines the default subclass for new branches 
- `.$branches.$get` lazy-creates a new branch based on branchClasses if none exists. 
- `.$branches.$add` creates a new branch; if a subclass is not defined will refer to the classes stored in branchClasses
