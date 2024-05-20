import Forest from '../../../lib/forest/Forest';
import { CrudEnum } from '../../../lib/forest/types';

describe('@wonderlandlabs/forest', () => {
  describe('Forest', () => {
    describe('constructor', () => {
      it('should not have unknown tables', () => {
        const forest = new Forest();
        expect(forest.has('foo')).toBeFalsy();
      });
    });

    describe('addTable', () => {
      const forest = new Forest();
      forest.addTable('foo');

      expect(forest.has('foo')).toBeTruthy();
    });

    describe('set value', () => {
      const forest = new Forest();
      const BOB = { name: 'Bob', age: 20 };

      forest.addTable('foo');

      forest.change([
        {
          id: 1,
          table: 'foo',
          value: BOB,
          action: CrudEnum.CRUD_ADD,
        },
      ]);

      expect(forest.tables.get('foo')!.get(1)).toEqual(BOB);
    });
    describe('set record', () => {
      const forest = new Forest();
      const BOB = { name: 'Bob', age: 20 };

      forest.addTable('foo');

      forest.change([
        {
          id: 1,
          table: 'foo',
          value: BOB,
          action: CrudEnum.CRUD_ADD,
        },
      ]);

      expect(forest.tables.get('foo')!.get(1)).toEqual(BOB);
    });

    describe('set field', () => {
      const BOB = { name: 'Bob', age: 20 };
      const forest = new Forest();

      forest.addTable('foo', {
        values: new Map([ [ 1, BOB ] ]),
      });

      forest.change([
        {
          id: 1,
          table: 'foo',
          field: 'age',
          value: 30,
          action: CrudEnum.CRUD_CHANGE,
        },
      ]);

      expect(forest.tables.get('foo')!.get(1)).toEqual({
        name: 'Bob',
        age: 30,
      });
    });
  });
});
