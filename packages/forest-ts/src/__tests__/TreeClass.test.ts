import { TreeClass, constants } from '../../lib'
import { TypeEnum } from '@wonderlandlabs/walrus'

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


      it('should allow values to be added', () => {
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

        expect(tree.get('foo', 200).content).toEqual('Rope')
      });

      describe('with preset values', () => {
        it('should accept existing values', () => {
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
              values: [
                { base: 1, squared: 1 },
                { base: 2, squared: 4 },
                { base: 3, squared: 9 }
              ]
            }
          );
          expect(tree.get('squares', 1).squared).toEqual(1);
          expect(tree.get('squares', 2).squared).toEqual(4);
          expect(tree.get('squares', 3).squared).toEqual(9);
        })
      })
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
            values: [
              { date: FIRST_DATE, cost: 200 }
            ]
          }
        );

        let history: any[] = [];

        tree.collection('costs')!.query({ identity: FIRST_DATE }).subscribe(
          // @ts-ignore
          ([leaf]) => {
            history.push(leaf.$value.cost)
          });

        expect(history).toEqual([200]);

        tree.put('costs', {
          date: FIRST_DATE,
          cost: 400
        });
        expect(history).toEqual([200, 400]);

        // doesn't echo lateral changes

        tree.put('costs', {
          date: '2023-02-01',
          cost: 600
        });
        expect(history).toEqual([200, 400]);

        // doesn't echo non-changes
        tree.put('costs', {
          date: FIRST_DATE,
          cost: 400
        });

        expect(history).toEqual([200, 400]);

        // will echo another real change
        tree.put('costs', {
          date: FIRST_DATE,
          cost: 300
        });
        expect(history).toEqual([200, 400, 300]);
      })

      it('should follow all records', () => {

        const tree = new TreeClass();
        tree.addCollection({
            name: 'costs',
            identity: 'date',
            fields: [
              { name: 'date', type: TypeEnum.string },
              { name: 'cost', type: TypeEnum.number }
            ],
            values: [
              { date: '2023-01-01', cost: 200 },
              { date: '2023-02-01', cost: 400 }
            ]
          },
        );

        let history: any[] = [];

        tree.query({ collection: 'costs' }).subscribe((values) => {
          history.push(values.map((leaf) => ([
            leaf.$identity,
            leaf.$value.cost
          ])))
        });

        expect(history).toEqual([
          [
            ['2023-01-01', 200],
            ['2023-02-01', 400]
          ]
        ]);

        tree.put('costs', { date: '2023-03-01', cost: 800 });
        expect(history).toEqual([
          [
            ['2023-01-01', 200],
            ['2023-02-01', 400]
          ],
          [
            ['2023-01-01', 200],
            ['2023-02-01', 400],
            ['2023-03-01', 800]
          ]
        ]);


        // doesn't echo non-changes
        tree.put('costs', { date: '2023-02-01', cost: 400 });
        expect(history).toEqual([
            [
              ['2023-01-01', 200],
              ['2023-02-01', 400]
            ],
            [
              ['2023-01-01', 200],
              ['2023-02-01', 400],
              ['2023-03-01', 800]
            ]
          ]
        );

        // acknowledges add
        tree.put('costs', { date: '2023-04-01', cost: 600 });
        expect(history).toEqual([
            [
              ['2023-01-01', 200],
              ['2023-02-01', 400]
            ],
            [
              ['2023-01-01', 200],
              ['2023-02-01', 400],
              ['2023-03-01', 800]
            ],
            [
              ['2023-01-01', 200],
              ['2023-02-01', 400],
              ['2023-03-01', 800],
              ['2023-04-01', 600]
            ]
          ]
        );

        /*
                // will echo another real change
                tree.put('costs', 'bar', 300);

                expect(history).toEqual(
                  [
                    [["foo", 100], ["bar", 200]],
                    [["foo", 100], ["bar", 400]],
                    [["foo", 100], ["bar", 400], ["vey", 500]],
                    [["foo", 100], ["bar", 300], ["vey", 500]]
                  ]
                );*/
      })

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
              values: [
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
              values: [
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

        const joined = tree.collection('people').fetch({
          joins: [{
            name: 'people-address'
          }]
        });

        joined.forEach((record) => console.log(JSON.stringify(record.toJSON())));

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

        tree.put('bob', { name: "Bob", age: 100 });

        expect(tree.collection('bob').fetch({}))
          .toEqual([{ $tree: tree, $collection: 'bob', $identity: SINGLE, $joins: {} }]);
      });
    });
  });
});
