import { Schema } from '../../lib'
import { TypeEnum } from '@wonderlandlabs/walrus/dist/enums'

function cleanBreaks(s: string) {
  return s.replace(/\n[\s]*/g, '\n').trim();
}

const ECHO = true
describe('Schema', () => {

  describe('typescript', () => {
    describe('scalar types', () => {
      it('should express scalar types', () => {
        const sch = new Schema('foo', {
          $type: TypeEnum.number
        });
        if (ECHO) {
       //   console.log('scalar:', sch.typescript)
        }
        expect(cleanBreaks(sch.typescript)).toEqual(
          cleanBreaks(
            `
                export namespace Foo {
                  export type $value = number
                }`
          )
        )
      });
    });

    describe('structures', () => {
      it('should express objects with scalar fields', () => {

        const sch = new Schema('bar', {
          $type: TypeEnum.object,
          fields: {
            alpha: {
              $type: TypeEnum.number,
            },
            beta: {
              $type: TypeEnum.string
            }
          }
        })
        if (ECHO) {
        //  console.log('objScalar:', sch.typescript)
        }
        expect(cleanBreaks(sch.typescript)).toEqual(cleanBreaks(`
            export namespace Bar {
            export namespace Alpha {
              export type $value = number
            }
            export namespace Beta {
              export type $value = string
            }
            export type $value = {
                    alpha: Alpha.$value,
                    beta: Beta.$value
                  }
          }

`))
      })

      it('should express objects with object fields', () => {

        const sch = new Schema('rect', {
          $type: TypeEnum.object,
          fields: {
            tl: {
              $type: TypeEnum.object,
              fields: {
                x: { $type: TypeEnum.number },
                y: { $type: TypeEnum.number }
              }
            },
            br: {
              $type: TypeEnum.object,
              fields: {
                x: { $type: TypeEnum.number },
                y: { $type: TypeEnum.number }
              }
            }
          }
        })
        if (ECHO) {
          // console.log('objObj:', sch.typescript)
        }
        expect(cleanBreaks(sch.typescript)).toEqual(cleanBreaks(`
  export namespace Rect {
    export namespace Tl {
      export namespace X {
        export type $value = number
      }
      export namespace Y {
        export type $value = number
      }
      export type $value = {
        x: X.$value,
        y: Y.$value
      }
    }
    export namespace Br {
      export namespace X {
        export type $value = number
      }
      export namespace Y {
        export type $value = number
      }
      export type $value = {
        x: X.$value,
        y: Y.$value
      }
    }
    export type $value = {
      tl: Tl.$value,
      br: Br.$value
    }
  }
`))
      })
    })
  })

})
