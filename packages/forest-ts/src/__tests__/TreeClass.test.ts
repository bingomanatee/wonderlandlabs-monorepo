import { TreeClass, constants } from '../../lib';
import { TypeEnum } from '@wonderlandlabs/walrus';
// @ts-expect-error for some reason the json import isn't TS friendly
import products from './testData.json';
import { UpdateMsg } from '../types';

const { isSingle, SINGLE } = constants;

describe('Forest', () => {
  describe('TreeClass', () => {
    describe('addCollection', () => {

      it('should add a named collection', () => {
        const tree = new TreeClass();

        expect(() => tree.collection('foo')).toThrow();

        tree.addCollection({
          name: 'foo',
          identity: 'id',
          fields: [
            { name: 'id' },
            { name: 'content' }
          ]
        });

        expect(tree.collection('foo')).toBeTruthy();
      });


      it('should allow records to be added', () => {
        const tree = new TreeClass();
        tree.addCollection({
          name: 'foo',
          identity: 'id',
          fields: [
            { name: 'id' },
            { name: 'content' }
          ]
        });
        tree.put('foo', { id: 100, content: 'Bob' });
        expect(tree.get('foo', 100).content).toEqual('Bob');
      });

      describe('with type constraints', () => {
        const tree = new TreeClass();
        tree.addCollection({
          name: 'foo',
          identity: 'id',
          fields: [
            { name: 'id', type: TypeEnum.number },
            { name: 'content', type: TypeEnum.string }
          ]
        });
        tree.put('foo', { id: 100, content: 'Box' });

        expect(tree.get('foo', 100).content).toEqual('Box');

        expect(() => {
          tree.put('foo', { id: 100, content: 100 });
        }).toThrow();

        tree.put('foo', { id: 200, content: 'Rope' });

        expect(tree.get('foo', 200).content).toEqual('Rope');
      });

      describe('with preset records', () => {
        it('should accept existing records', () => {
          const tree = new TreeClass();
          tree.addCollection({
            name: 'squares',
            identity: 'base',
            fields: [
              {
                name: 'base',
                type: TypeEnum.number
              },
              {
                name: 'squared',
                type: TypeEnum.number
              }
            ],
            records: [
              { base: 1, squared: 1 },
              { base: 2, squared: 4 },
              { base: 3, squared: 9 }
            ]
          }
          );
          expect(tree.get('squares', 1).squared).toEqual(1);
          expect(tree.get('squares', 2).squared).toEqual(4);
          expect(tree.get('squares', 3).squared).toEqual(9);
        });
      });
    });

    describe('query', () => {
      it('should follow a record', () => {
        const FIRST_DATE = '2023-01-01';

        const tree = new TreeClass();
        tree.addCollection({
          name: 'costs',
          identity: 'date',
          fields: [
            { name: 'date', type: TypeEnum.string },
            { name: 'cost', type: TypeEnum.number }
          ],
          records: [
            { date: FIRST_DATE, cost: 200 }
          ]
        }
        );

        const history: any[] = [];

        const collection = tree.collection('costs');
        expect(collection).toBeTruthy();
        collection.query({ identity: FIRST_DATE }).subscribe(
          ([ leaf ]) => {
            history.push(leaf.$value.cost);
          });

        expect(history).toEqual([ 200 ]);

        tree.put('costs', {
          date: FIRST_DATE,
          cost: 400
        });
        expect(history).toEqual([ 200, 400 ]);

        // doesn't echo lateral changes

        tree.put('costs', {
          date: '2023-02-01',
          cost: 600
        });
        expect(history).toEqual([ 200, 400 ]);

        // doesn't echo non-changes
        tree.put('costs', {
          date: FIRST_DATE,
          cost: 400
        });

        expect(history).toEqual([ 200, 400 ]);

        // will echo another real change
        tree.put('costs', {
          date: FIRST_DATE,
          cost: 300
        });
        expect(history).toEqual([ 200, 400, 300 ]);
      });

      it('should follow all records', () => {

        const tree = new TreeClass();
        tree.addCollection({
          name: 'costs',
          identity: 'date',
          fields: [
            { name: 'date', type: TypeEnum.string },
            { name: 'cost', type: TypeEnum.number }
          ],
          records: [
            { date: '2023-01-01', cost: 200 },
            { date: '2023-02-01', cost: 400 }
          ]
        },
        );

        const history: any[] = [];

        tree.query({ collection: 'costs' }).subscribe((records) => {
          history.push(records.map((leaf) => ([
            leaf.$identity,
            leaf.$value.cost
          ])));
        });

        expect(history).toEqual([
          [
            [ '2023-01-01', 200 ],
            [ '2023-02-01', 400 ]
          ]
        ]);

        tree.put('costs', { date: '2023-03-01', cost: 800 });
        expect(history).toEqual([
          [
            [ '2023-01-01', 200 ],
            [ '2023-02-01', 400 ]
          ],
          [
            [ '2023-01-01', 200 ],
            [ '2023-02-01', 400 ],
            [ '2023-03-01', 800 ]
          ]
        ]);


        // doesn't echo non-changes
        tree.put('costs', { date: '2023-02-01', cost: 400 });
        expect(history).toEqual([
          [
            [ '2023-01-01', 200 ],
            [ '2023-02-01', 400 ]
          ],
          [
            [ '2023-01-01', 200 ],
            [ '2023-02-01', 400 ],
            [ '2023-03-01', 800 ]
          ]
        ]
        );

        // acknowledges add
        tree.put('costs', { date: '2023-04-01', cost: 600 });
        expect(history).toEqual([
          [
            [ '2023-01-01', 200 ],
            [ '2023-02-01', 400 ]
          ],
          [
            [ '2023-01-01', 200 ],
            [ '2023-02-01', 400 ],
            [ '2023-03-01', 800 ]
          ],
          [
            [ '2023-01-01', 200 ],
            [ '2023-02-01', 400 ],
            [ '2023-03-01', 800 ],
            [ '2023-04-01', 600 ]
          ]
        ]
        );
      });

      it('should join related records', () => {
        const tree = new TreeClass(
          [
            {
              name: 'people',
              identity: 'id',
              fields: {
                id: TypeEnum.number,
                name: TypeEnum.string,
                address: TypeEnum.number,
              },
              records: [
                {
                  id: 100,
                  name: 'Bob',
                  address: 1,
                },
                {
                  id: 200,
                  name: 'Sue',
                  address: 2,
                },
                {
                  id: 300,
                  name: 'Pat',
                  address: 0
                },
                {
                  id: 400,
                  name: 'Jim',
                  address: 2
                }
              ]
            },
            {
              name: 'address',
              identity: 'id',
              fields: {
                id: TypeEnum.number,
                addr: TypeEnum.string,
                city: TypeEnum.string,
                state: TypeEnum.string,
              },
              records: [
                {
                  id: 1,
                  addr: '100 First St',
                  city: 'Portland',
                  state: 'OR'
                },
                {
                  id: 2,
                  addr: '333 Folsom St',
                  city: 'San Francisco',
                  state: 'CA'
                }
              ]
            }
          ],
          [
            {
              name: 'people-address',
              from: 'people',
              fromField: 'address',
              to: 'address'
            }
          ]
        );

        const fetched = tree.collection('people').fetch({
          joins: [ {
            name: 'people-address'
          } ]
        });

        const fetchedJSON = fetched.map((record) => record.toJSON());

        expect(fetchedJSON).toEqual(
          [ {
            'value': { 'id': 100, 'name': 'Bob', 'address': 1 },
            'identity': 100,
            'collection': 'people',
            'joins': {
              'people-address': [ {
                'value': {
                  'id': 1,
                  'addr': '100 First St',
                  'city': 'Portland',
                  'state': 'OR'
                }, 'identity': 1, 'collection': 'address', 'joins': {}
              } ]
            }
          }, {
            'value': { 'id': 200, 'name': 'Sue', 'address': 2 },
            'identity': 200,
            'collection': 'people',
            'joins': {
              'people-address': [ {
                'value': {
                  'id': 2,
                  'addr': '333 Folsom St',
                  'city': 'San Francisco',
                  'state': 'CA'
                }, 'identity': 2, 'collection': 'address', 'joins': {}
              } ]
            }
          }, {
            'value': { 'id': 300, 'name': 'Pat', 'address': 0 },
            'identity': 300,
            'collection': 'people',
            'joins': { 'people-address': [] }
          }, {
            'value': { 'id': 400, 'name': 'Jim', 'address': 2 },
            'identity': 400,
            'collection': 'people',
            'joins': {
              'people-address': [ {
                'value': {
                  'id': 2,
                  'addr': '333 Folsom St',
                  'city': 'San Francisco',
                  'state': 'CA'
                }, 'identity': 2, 'collection': 'address', 'joins': {}
              } ]
            }
          } ]
        );

        const addressFetched = tree.collection('address').fetch({
          joins: [ {
            name: 'people-address'
          } ]
        });

        const addressFetchedJSON = addressFetched.map(record => record.toJSON());

        expect(addressFetchedJSON).toEqual(
          [ {
            'value': { 'id': 1, 'addr': '100 First St', 'city': 'Portland', 'state': 'OR' },
            'identity': 1,
            'collection': 'address',
            'joins': {
              'people-address': [ {
                'value': { 'id': 100, 'name': 'Bob', 'address': 1 },
                'identity': 100,
                'collection': 'people',
                'joins': {}
              } ]
            }
          }, {
            'value': { 'id': 2, 'addr': '333 Folsom St', 'city': 'San Francisco', 'state': 'CA' },
            'identity': 2,
            'collection': 'address',
            'joins': {
              'people-address': [ {
                'value': { 'id': 200, 'name': 'Sue', 'address': 2 },
                'identity': 200,
                'collection': 'people',
                'joins': {}
              }, {
                'value': { 'id': 400, 'name': 'Jim', 'address': 2 },
                'identity': 400,
                'collection': 'people',
                'joins': {}
              } ]
            }
          } ]
        );
      });

      it('should deep join records', () => {
        const tree = new TreeClass(
          [
            {
              name: 'people',
              identity: 'id',
              fields: {
                id: TypeEnum.number,
                name: TypeEnum.string,
                address: TypeEnum.number,
              },
              records: [
                {
                  id: 100,
                  name: 'Bob',
                  address: 1,
                },
                {
                  id: 200,
                  name: 'Sue',
                  address: 2,
                },
                {
                  id: 300,
                  name: 'Pat',
                  address: 0
                },
                {
                  id: 400,
                  name: 'Jim',
                  address: 2
                }
              ]
            },
            {
              name: 'address',
              identity: 'id',
              fields: {
                id: TypeEnum.number,
                addr: TypeEnum.string,
                city: TypeEnum.string,
                state: TypeEnum.string,
              },
              records: [
                {
                  id: 1,
                  addr: '100 First St',
                  city: 'Portland',
                  state: 'OR'
                },
                {
                  id: 2,
                  addr: '333 Folsom St',
                  city: 'San Francisco',
                  state: 'CA'
                }
              ]
            },
            {
              name: 'state',
              identity: 'abbr',
              fields: {
                abbr: TypeEnum.string,
                name: TypeEnum.string
              },
              records: [
                {
                  abbr: 'CA',
                  name: 'California',
                },
                {
                  abbr: 'OR', name: 'Oregon'
                },
                {
                  abbr: 'WA', name: 'Washington'
                }
              ]
            }
          ],
          [
            {
              name: 'people-address',
              from: 'people',
              fromField: 'address',
              to: 'address'
            },
            {
              name: 'address-state',
              from: 'address',
              fromField: 'state',
              to: 'state'
            }
          ]
        );

        const fetched = tree.collection('people').fetch({
          joins: [ {
            name: 'people-address',
            joins: [
              { name: 'address-state' }
            ]
          } ]
        });
        const json = fetched.map(record => record.toJSON());

        expect(json).toEqual(
          [ {
            'value': { 'id': 100, 'name': 'Bob', 'address': 1 },
            'identity': 100,
            'collection': 'people',
            'joins': {
              'people-address': [ {
                'value': {
                  'id': 1,
                  'addr': '100 First St',
                  'city': 'Portland',
                  'state': 'OR'
                },
                'identity': 1,
                'collection': 'address',
                'joins': {
                  'address-state': [ {
                    'value': { 'abbr': 'OR', 'name': 'Oregon' },
                    'identity': 'OR',
                    'collection': 'state',
                    'joins': {}
                  } ]
                }
              } ]
            }
          }, {
            'value': { 'id': 200, 'name': 'Sue', 'address': 2 },
            'identity': 200,
            'collection': 'people',
            'joins': {
              'people-address': [ {
                'value': {
                  'id': 2,
                  'addr': '333 Folsom St',
                  'city': 'San Francisco',
                  'state': 'CA'
                },
                'identity': 2,
                'collection': 'address',
                'joins': {
                  'address-state': [ {
                    'value': { 'abbr': 'CA', 'name': 'California' },
                    'identity': 'CA',
                    'collection': 'state',
                    'joins': {}
                  } ]
                }
              } ]
            }
          }, {
            'value': { 'id': 300, 'name': 'Pat', 'address': 0 },
            'identity': 300,
            'collection': 'people',
            'joins': { 'people-address': [] }
          }, {
            'value': { 'id': 400, 'name': 'Jim', 'address': 2 },
            'identity': 400,
            'collection': 'people',
            'joins': {
              'people-address': [ {
                'value': {
                  'id': 2,
                  'addr': '333 Folsom St',
                  'city': 'San Francisco',
                  'state': 'CA'
                },
                'identity': 2,
                'collection': 'address',
                'joins': {
                  'address-state': [ {
                    'value': { 'abbr': 'CA', 'name': 'California' },
                    'identity': 'CA',
                    'collection': 'state',
                    'joins': {}
                  } ]
                }
              } ]
            }
          } ]
        );

        const stateFetched = tree.collection('state').fetch({
          joins: [
            {
              name: 'address-state', joins: [
                {
                  name: 'people-address'
                }
              ]
            }
          ]
        });
        const stateJson = stateFetched.map(record => record.toJSON());

        expect(stateJson).toEqual(
          [ {
            'value': { 'abbr': 'CA', 'name': 'California' },
            'identity': 'CA',
            'collection': 'state',
            'joins': {
              'address-state': [ {
                'value': {
                  'id': 2,
                  'addr': '333 Folsom St',
                  'city': 'San Francisco',
                  'state': 'CA'
                },
                'identity': 2,
                'collection': 'address',
                'joins': {
                  'people-address': [ {
                    'value': { 'id': 200, 'name': 'Sue', 'address': 2 },
                    'identity': 200,
                    'collection': 'people',
                    'joins': {}
                  }, {
                    'value': { 'id': 400, 'name': 'Jim', 'address': 2 },
                    'identity': 400,
                    'collection': 'people',
                    'joins': {}
                  } ]
                }
              } ]
            }
          }, {
            'value': { 'abbr': 'OR', 'name': 'Oregon' },
            'identity': 'OR',
            'collection': 'state',
            'joins': {
              'address-state': [ {
                'value': {
                  'id': 1,
                  'addr': '100 First St',
                  'city': 'Portland',
                  'state': 'OR'
                },
                'identity': 1,
                'collection': 'address',
                'joins': {
                  'people-address': [ {
                    'value': { 'id': 100, 'name': 'Bob', 'address': 1 },
                    'identity': 100,
                    'collection': 'people',
                    'joins': {}
                  } ]
                }
              } ]
            }
          }, {
            'value': { 'abbr': 'WA', 'name': 'Washington' },
            'identity': 'WA',
            'collection': 'state',
            'joins': { 'address-state': [] }
          } ]
        );
      });

      it('should sort records by sort field in query', () => {
        const tree = new TreeClass(
          [
            {
              name: 'people',
              identity: 'id',
              fields: {
                id: TypeEnum.number,
                name: TypeEnum.string,
              },
              records: [
                {
                  id: 100,
                  name: 'Bob'
                },
                { id: 200, name: 'alex' }
              ]
            },
            {
              name: 'purchases',
              identity: 'id',
              fields: {
                customer: TypeEnum.number,
                product: TypeEnum.string,
                id: TypeEnum.number,
                amount: TypeEnum.number
              },
              records: [
                {
                  id: 1,
                  product: 'Figs',
                  customer: 100,
                  amount: 50
                },
                {
                  id: 2,
                  product: 'Gas',
                  customer: 100,
                  amount: 10
                },
                {
                  id: 3,
                  product: 'Ham',
                  customer: 100,
                  amount: 105
                },
                {
                  id: 4,
                  product: 'Jam',
                  customer: 100,
                  amount: 5
                },
                {
                  id: 5,
                  product: 'Dogs',
                  customer: 100,
                  amount: 3000
                }
              ]
            }
          ],
          [
            {
              name: 'people-purchases',
              from: 'people',
              to: 'purchases',
              toField: 'customer',
            }
          ]
        );

        const fetch = tree.collection('people').fetch({
          joins: [
            {
              collection: 'purchases',
              sorter: 'amount'
            }
          ]
        });

        const json = fetch.map((r) => r.toJSON());


        expect(json).toEqual(
          [ {
            'value': { 'id': 100, 'name': 'Bob' },
            'identity': 100,
            'collection': 'people',
            'joins': {
              'people-purchases': [ {
                'value': { 'id': 4, 'product': 'Jam', 'customer': 100, 'amount': 5 },
                'identity': 4,
                'collection': 'purchases',
                'joins': {}
              }, {
                'value': { 'id': 2, 'product': 'Gas', 'customer': 100, 'amount': 10 },
                'identity': 2,
                'collection': 'purchases',
                'joins': {}
              }, {
                'value': { 'id': 1, 'product': 'Figs', 'customer': 100, 'amount': 50 },
                'identity': 1,
                'collection': 'purchases',
                'joins': {}
              }, {
                'value': { 'id': 3, 'product': 'Ham', 'customer': 100, 'amount': 105 },
                'identity': 3,
                'collection': 'purchases',
                'joins': {}
              }, {
                'value': { 'id': 5, 'product': 'Dogs', 'customer': 100, 'amount': 3000 },
                'identity': 5,
                'collection': 'purchases',
                'joins': {}
              } ]
            }
          }, {
            'value': { 'id': 200, 'name': 'alex' },
            'identity': 200,
            'collection': 'people',
            'joins': { 'people-purchases': [] }
          } ]
        );

        const fetchByProduct = tree.collection('people').fetch({
          joins: [
            {
              collection: 'purchases',
              sorter: 'product'
            }
          ]
        });
        const byProductJason = fetchByProduct.map((r) => r.toJSON());

        expect(byProductJason).toEqual([ {
          'value': { 'id': 100, 'name': 'Bob' },
          'identity': 100,
          'collection': 'people',
          'joins': {
            'people-purchases': [ {
              'value': { 'id': 5, 'product': 'Dogs', 'customer': 100, 'amount': 3000 },
              'identity': 5,
              'collection': 'purchases',
              'joins': {}
            }, {
              'value': { 'id': 1, 'product': 'Figs', 'customer': 100, 'amount': 50 },
              'identity': 1,
              'collection': 'purchases',
              'joins': {}
            }, {
              'value': { 'id': 2, 'product': 'Gas', 'customer': 100, 'amount': 10 },
              'identity': 2,
              'collection': 'purchases',
              'joins': {}
            }, {
              'value': { 'id': 3, 'product': 'Ham', 'customer': 100, 'amount': 105 },
              'identity': 3,
              'collection': 'purchases',
              'joins': {}
            }, {
              'value': { 'id': 4, 'product': 'Jam', 'customer': 100, 'amount': 5 },
              'identity': 4,
              'collection': 'purchases',
              'joins': {}
            } ]
          }
        }, {
          'value': { 'id': 200, 'name': 'alex' },
          'identity': 200,
          'collection': 'people',
          'joins': { 'people-purchases': [] }
        } ]
        );
      });
    });

    describe('SINGLE collections', () => {
      it('should create a single record without a defined ID', () => {
        const tree = new TreeClass();
        tree.addCollection({
          name: 'bob',
          identity: isSingle,
          fields: [
            {
              name: 'name',
              type: TypeEnum.string
            },
            {
              name: 'age',
              type: TypeEnum.number
            }
          ]
        });

        tree.put('bob', { name: 'Bob', age: 100 });

        expect(tree.collection('bob').fetch({}))
          .toEqual([ { $tree: tree, $collection: 'bob', $identity: SINGLE, $joins: {} } ]);
      });
    });

    /* validating that all legitimate activity is logged */
    describe('update', () => {
      describe('put', () => {
        console.log('---- update start');
        const shoppingSite = new TreeClass(products.products.collections);
        expect(shoppingSite.collection('products')!.values.size).toBe(3); // double checking pre-existing data
        const messages: UpdateMsg[] = [];
        const sub = shoppingSite.updates.subscribe({
          next(msg: UpdateMsg) {
            messages.push(msg);
          }
        });

        expect(messages.length).toEqual(0);

        shoppingSite.put('products', { name: 'Barbie', cost: 25.00, sku: '666-DOLL' });
        console.log('----- messages are now:', messages);

        const [ m1, m2 ] = messages;
        expect(messages.length).toEqual(2);
        expect(m1.action).toEqual('put-data');
        expect(m1.identity).toEqual('666-DOLL');
        expect(m2.action).toEqual('update-collection');
        expect(m2.collection).toEqual('products');
        sub.unsubscribe();
        console.log('---- update end');
      });
      describe('put(invalid)', () => {
        console.log('---- update start');
        const shoppingSite = new TreeClass(products.products.collections);

        const messages: UpdateMsg[] = [];
        const sub = shoppingSite.updates.subscribe({
          next(msg: UpdateMsg) {
            messages.push(msg);
          }
        });

        expect(() => {
          shoppingSite.put('products', { name: 'Barbie', cost: 25.00, sku: 1000 }); // invalid - sku cannot be number.

        }).toThrow();

        expect(messages.length).toEqual(0);
      });
    });
  });
});
