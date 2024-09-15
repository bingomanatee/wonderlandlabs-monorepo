import { engineForm } from "../../engines/form/engineForm";
import Forest from "../../Forest";


describe('engienForm', () => {
    describe('initialization', () => {
        it('has the right form props', () => {

            const f = new Forest([engineForm]);

            const myForm = f.tree('myForm', {
                engineName: 'form'
                val: {
                }
            }})
        })

    })

})