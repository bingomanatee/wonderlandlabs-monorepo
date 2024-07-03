"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore
const Forest_1 = require("../Forest");
describe('Forest', () => {
    // tests the existential ability for tree() to retrieve
    // and that it can retrieve (undefiend) without breaking
    describe('.tree()', () => {
        it('should return undefined for absent tree', () => {
            //@ts-ignore
            const f = new Forest_1.Forest();
            expect(f.tree('alpha')).toBeFalsy();
        });
        it('should return a tree', () => {
            //@ts-ignore
            const f = new Forest_1.Forest();
            f.addTree({ name: 'alpha' });
            expect(f.tree('alpha')).toBeTruthy();
        });
    });
    // tests that hasTree mirrors the result of the tree being present
    describe('.hasTree()', () => {
        it('should return undefined for absent tree', () => {
            //@ts-ignore
            const f = new Forest_1.Forest();
            expect(f.hasTree('alpha')).toBe(false);
        });
        it('should return a tree', () => {
            //@ts-ignore
            const f = new Forest_1.Forest();
            f.addTree({ name: 'alpha' });
            expect(f.hasTree('alpha')).toBe(true);
        });
    });
    describe('addTree', () => {
        it('should add a ree with no map', () => {
            const f = new Forest_1.Forest();
            f.addTree({ name: 'alpha' });
            expect(f.hasTree('alpha')).toBe(true);
        });
        it('should add a ree with a map', () => {
            const f = new Forest_1.Forest();
            f.addTree({ name: 'alpha', data: new Map([
                    [100, { name: 'Bob', age: 20 }],
                    [200, { name: 'Sue', age: 30 }]
                ]) });
            expect(f.hasTree('alpha')).toBe(true);
            //@ts-ignore
            expect(f.get({ treeName: 'alpha', key: 100 }).val.name).toBe('Bob');
        });
    });
});
