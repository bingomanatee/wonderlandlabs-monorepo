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
