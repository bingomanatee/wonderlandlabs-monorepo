import { ForestIF } from '../types';
//@ts-ignore
import { Forest } from '../Forest';

describe('Forest', () => {

    describe('tree', () => {

        it('should return undefined for missing tree', () => {

            //@ts-ignore
            const f: ForestIF = new Forest();

            expect(f.tree('alpha')).toBeFalsy();
        })
    })

})