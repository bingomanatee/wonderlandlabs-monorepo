import { Forest } from "../Forest";
import { BranchIF } from "../types";



describe('branches', () => {

    describe('Banch IDs', () => {

        it('always adds higher IDs to a trees braches', () => {

            const f = new Forest();

            const alpha = f.addTree({ name: 'alpha' });
            const beta = f.addTree({ name: 'beta' });

            beta.set(1, 'one');
            alpha.set(2, 'two');
            alpha.set(3, 'three');
            beta.set(4, 'four');
            beta.set(5, '5');

            const alphaIDs = [4, 5];
            let alphaBranch: BranchIF | undefined = alpha.root!;

            while (alphaBranch) {
                expect(alphaBranch.id).toEqual(alphaIDs.shift());
                alphaBranch = alphaBranch.next;
            }

            let betaIds = [2, 6, 7]
            let betaBranch: BranchIF | undefined = beta.root;

            while (betaBranch) {
                expect(betaBranch.id).toEqual(betaIds.shift());
                betaBranch = betaBranch.next;
            }

        });

        it('increments even if the branches are removed', () => {
            const f = new Forest();
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
            expect(ids).toEqual([7, 8, 9])
        })
    });
});