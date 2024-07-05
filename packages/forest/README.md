# Forest 3.0 : "Forestry"

Forest is an attempt to create a journalled, transactional synchronous, query based muuti collection database.

It is intened as a Redis Killer for client side / react apps, but can have other applications.

## Journeled

every collection -- 'Tree' -- has an initial k/v store. Every update is a linked list that defines the key/values that are added or deleted.
These changes are synchronous - that is, the update is appended to the tree and creates a subsitute value(values) for the base.

### Pending

New changes are marked as pending.

- Asyncronous changes may be awaiting the return of data from a remote source ('syncrhonization'). All changes inside a transaction are cosidered pending until the transaction is completed.
- Changes to a base with a validation pipe are considered transient until the vaildation is passed.

### Good

Good changes have passed any validation and are permanant. (unless they are contained by a pending transaction).

### Bad

Bad changes have failed validation (or synchronization).

## Heirarchy of data

Data in a Forest are contained within a three-level heirarchy:

- Forests contain zero or many Trees;
- Trees are contain zero or many Leafs;
- A leaf is a coincidence of a key and a value.

This is analogous to a Database with Tables and indexed rows.

## Type definitions of Trees

Trees are formally defined as having a single type of key and value. (<$K,$V>); however given the fact that Forests contain many trees and its impossible
to know what the key / value type of a tree is given its name, the k/v type retuned by `tree(name)` is unknown; you must use `as` to enforece a more specifically typed tree.

## Transactional

Transactions create "batches" of changes that either SUCCEED or FAIL as a group. This means that any failures of specific changes bring all the changes following the opening of the transaction to a halt. Similarly the contained changes are all considered "atomic" - when a transcation is completed they are all "squashed" into a single changeset (per table).

This prevents "partial/broken" updates to occur. For instance if you have a rule that one tables' records' foreign key must have a relationship to another tables' content,
you may have one transaction to seed the foreign record and another to assert the related record. At the end of the transaction, if the foreign key/related record is not valid, ALL the changes in the change set may end up getting rolled back.

## Query Based

Getting data from a Forest is done with a _query_. Query defines which records are retrieved; they can be a simple "by key" retrieval, or a complex graph of related records.
Querys can execute once or may create a "stream" that is updated every time the source tree(s) are updated.

# Why Forest 3.0?

## 1. Because RxDB

I learned a lot reading RxDB code and wanted to leverage some of their techniques. However RxDB
is a different beast and has a different place in the ecosystem.

* Forest is Memory Only - RxDB is multi-store
* Forest is sync; RxDB is Async
* Forest embraces transactions - RxDB does not
* Forest doesn't have a locked in schema (yet) - RxDB does
* Forest hopes to embrace multi-table nested queries - RXDB are flat key-value stores
* Forest strongly embraces journal-driven data integrity, in part because of its transactional aims. 

That being said - the overarching goal of a streaming, structured store is shared betwen the two systems. Moving control to a centralized Forest graph makes sense in Forest 3.0.

## 2. Because Forest 2.0 has too much code

In a goal to use modular transactio, Forest 2.0 became a huge and verbose system. In part because the
stoore and the jouranl were two seperate beasts. Unifying store and data in a single chain makes a lot 
of what used to be verbose and difficul to read relatively simple. 

## 3. Because Forest really doesn't need all the dependencies used in Forest 2.0,

@wonderlandlabs/collect for all its power really wasn't needed for Forest; as fun ad powerful as it is, Forest really
can do fine with POJOs, Maps and RxJS. Having less dense depenedencies should make things run a lot faster and simpler. 

There is some loss of features; Forest now is wholly Map/Key-value driven, and if you want stores to have other formats, 
as of today (July 5 2024) you do have to use your own IO logic to transfer data into a map. 

Future releses for a more Object-driven store system will be added once the basic principles are proven and tested. 
But the payout here is that the code required to drive Forest 3.0 is vastly smaller than the previous edition. 

# Taxonomy and architecture

Forest uses a key/value/map driven heirarchy, 

* Every data graph requires a Forest to be created for it. 
* Forests have 0+ __Trees__ each identified by a name (string). 
* Each tree has 0+ __Values__ iedntified by a __Key__ in the data map. No assumption for type is made for either,
  but trees can bey identified/as'ed into a Generic pattern.. `myTree: TreeIF<keyType, valueType> = myForest.tree('name') as TreeIF<keyType, valueType>`. 
* Values can be basic property values (heterogeneus) or records (homogenous). No assumption is made about the depth of a tree. 

Internally tree data is maintained in a Branch. Each branch has a data map which overrides/annotates the previous one. thus, each `myTree.set(k, v)` call creates a branch which journals that action. 

When you call `myTree.get(k)`, the journal is traversed most recent to last recent until a value is found for that key. 
For efficiency a cache can be asserted at any branch contaiing all previous values, to impprove retrieval time. Once a branch
with a cache is found, the cache is trusted and no further parent branches are polled. 

## TMI: caching and garbage collection

Forest by default will cache every eight branches. You can manually lower the cacheInterval when you configure forest by passing it as a constructor parameter. (todo: tree-level config for cacheInterval). You can even set it to 0 to create rolling
caches for each branch, 

Caches can of course get pretty heavy after a while. However, every time you create a cache, it will clear out caches above it, 
so a tree will never have more than one cached branch -- unless it has a transaction(scope); cache-clearing is blocked by a scope, so that you're not constantly destroying/recreatig caches when scopes are active. But clearing out the last transaction should garbage-collect caches below the last one. 
