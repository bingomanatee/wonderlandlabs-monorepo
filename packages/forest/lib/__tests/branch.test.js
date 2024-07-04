"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Forest_1 = require("../Forest");
describe('branches', () => {
    describe('Banch IDs', () => {
        it('always adds higher IDs to a trees braches', () => {
            const f = new Forest_1.Forest();
            const alpha = f.addTree({ name: 'alpha' });
            const beta = f.addTree({ name: 'beta' });
            beta.set(1, 'one');
            alpha.set(2, 'two');
            alpha.set(3, 'three');
            beta.set(4, 'four');
            beta.set(5, '5');
            const alphaIDs = [2, 3];
            const alphaBranchIDs = alpha.branches.map((b) => b.id);
            expect(alphaBranchIDs).toEqual(alphaIDs);
            let betaIDs = [1, 4, 5];
            const betaBranchIDs = beta.branches.map((b) => b.id);
            expect(betaBranchIDs).toEqual(betaIDs);
        });
        it('increments even if the branches are removed', () => {
            const f = new Forest_1.Forest();
            const alpha = f.addTree({ name: 'alpha' });
            // we don't care about values or indexes really we are just seeing how IDs play out here. 
            alpha.set(1, null);
            alpha.set(2, null);
            alpha.set(3, null);
            alpha.set(4, null);
            alpha.clearValues();
            alpha.set(3, null);
            alpha.set(1, null);
            alpha.set(10, null);
            const ids = alpha.branches.map(b => b.id);
            expect(ids).toEqual([5, 6, 7]);
        });
    });
});
