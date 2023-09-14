import { Schema } from '../../lib'
import { TypeEnum } from '@wonderlandlabs/walrus/dist/enums'

function cleanBreaks(s: string) {
  return s.replace(/\n[\s]*/g, '\n').trim();
}

const ECHO = true
describe('Leafs', () => {

  describe ('subscripitions', () => {
    it('should update composedValue when child changes', () => {

      const PointSchema = new Schema({name: 'point', $type: TypeEnum.object})

      const RectSchema = new Schema({name: 'rect', $type: TypeEnum.object,
      fields: {
        tl: PointSchema,
        br: PointSchema
      }
      })

    });
  });
});
