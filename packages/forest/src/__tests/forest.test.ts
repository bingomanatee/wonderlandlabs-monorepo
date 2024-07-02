import { ForestIF } from '../types';
//@ts-ignore
import { Forest } from '../Forest';

describe('Forest', () => {

    describe('.tree()', () => {

        it('should return undefined for absent tree', () => {

            //@ts-ignore
            const f: ForestIF = new Forest();

            expect(f.tree('alpha')).toBeFalsy();
        })
        it('should return a tree', () => {

            //@ts-ignore
            const f: ForestIF = new Forest();

            f.addTree({ treeName: 'alpha' });
            expect(f.tree('alpha')).toBeTruthy();
        })
    })

})