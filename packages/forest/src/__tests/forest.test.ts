import { ForestIF, LeafIF } from '../types';
//@ts-ignore
import { Forest } from '../Forest';

describe('Forest', () => {

    // tests the existential ability for tree() to retrieve
    // and that it can retrieve (undefiend) without breaking
    describe('.tree()', () => {

        it('should return undefined for absent tree', () => {

            //@ts-ignore
            const f: ForestIF = new Forest();

            expect(f.tree('alpha')).toBeFalsy();
        })
        it('should return a tree', () => {

            //@ts-ignore
            const f: ForestIF = new Forest();

            f.addTree({ name: 'alpha' });
            expect(f.tree('alpha')).toBeTruthy();
        })
    })

    // tests that hasTree mirrors the result of the tree being present
    describe('.hasTree()', () => {

        it('should return undefined for absent tree', () => {

            //@ts-ignore
            const f: ForestIF = new Forest();

            expect(f.hasTree('alpha')).toBe(false);
        })
        it('should return a tree', () => {

            //@ts-ignore
            const f: ForestIF = new Forest();

            f.addTree({ name: 'alpha' });
            expect(f.hasTree('alpha')).toBe(true);
        })
    });

    describe('addTree', () => {

        it('should add a ree with no map', () => {

            const f = new Forest();
            f.addTree({ name: 'alpha' });
            expect(f.hasTree('alpha')).toBe(true);
            expect(f.get({ treeName: 'alpha', key: 100 }).hasValue).toBe(false);

        })
        it('should add a ree with a map', () => {

            type UserType = { name: string, age: number };

            const f = new Forest();
            f.addTree({
                name: 'alpha', data: new Map([
                    [100, { name: 'Bob', age: 20 }],
                    [200, { name: 'Sue', age: 30 }]
                ])
            });
            expect(f.hasTree('alpha')).toBe(true);

            const bobResponse = f.get({ treeName: 'alpha', key: 100 }) as LeafIF<number, UserType>;
            if (typeof bobResponse.val === 'symbol') throw new Error('Bob not found');
            expect(bobResponse.val.name).toBe('Bob');
            const sueResponse = f.get({ treeName: 'alpha', key: 200 }) as LeafIF<number, UserType>;
            if (typeof sueResponse.val === 'symbol') throw new Error('Sue not found');
            expect(sueResponse.val.age).toBe(30)
        })
    })

})