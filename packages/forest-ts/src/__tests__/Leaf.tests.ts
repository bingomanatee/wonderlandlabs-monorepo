import { Leaf, Schema } from '../../lib'
import { TypeEnum } from '@wonderlandlabs/walrus/dist/enums'

function cleanBreaks(s: string) {
  return s.replace(/\n[\s]*/g, '\n').trim();
}

const ECHO = true
describe('Leafs', () => {

  describe('get/set value', () =>  {
    describe ('static leafs', () => {
      it('should have initial value', () => {
        const leaf = new Leaf(100, {});
        expect(leaf.$value).toEqual(100);
      });

      it('should reflect updates', () => {
        const leaf = new Leaf(100, {});

        const history: any[] = [];

        leaf.$subject.subscribe((value) => history.push(value));

        leaf.$value = 200;
        leaf.$value = 300;
        expect(leaf.$value).toEqual(300);
        expect(history).toEqual([100, 200, 300]);
      });
    });
  });

  describe('children', () => {
    describe('objects', () => {
      it('should reflect values up and down the chain', () => {
        const point = new Leaf({x: 0, y: 0, z: 0} , {
          fields: [
            new Schema('x', {
              $type: TypeEnum.number
            }),
            new Schema('y', {
              $type: TypeEnum.number,
            }),
            new Schema('z', {
              $type: TypeEnum.number,
            }),
          ]
        });

        expect(point.$value).toEqual({x: 0, y: 0, z: 0});

        point.$child('x').$value = 100;
        expect(point.$value).toEqual({x: 100, y: 0, z: 0});

      });
    });
  });
});
