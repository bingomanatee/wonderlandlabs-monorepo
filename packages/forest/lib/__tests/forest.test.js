"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore
const Forest_1 = require("../Forest");
describe('Forest', () => {
    describe('.tree()', () => {
        it('should return undefined for absent tree', () => {
            //@ts-ignore
            const f = new Forest_1.Forest();
            expect(f.tree('alpha')).toBeFalsy();
        });
        it('should return a tree', () => {
            //@ts-ignore
            const f = new Forest_1.Forest();
            f.addTree({ treeName: 'alpha' });
            expect(f.tree('alpha')).toBeTruthy();
        });
    });
});
