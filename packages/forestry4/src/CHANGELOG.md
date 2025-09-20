# Changelog

## 4.0 

redesigned Forestry to hve a slimmer profile; got rid of the "context" forest 
and using one base class for all types of values. 

## 4.1 

Radical refactor - using classes and class methods over the $ / act form for 
much simpler/ better type safe forests

## 4.1.2 .. 4.1.4

Compresing classes to make a single base class (Forest); renaming key methods with 
"$" prefix to make custom functions less intrusive. note - to keep in the RxJS 
pattern for obervables Subject fields (value, next, complete...) are not $-prefixed.

## 4.1.5 ..6

Adding $ back as a "bound" mirror of the base class for ease of use in React. 





