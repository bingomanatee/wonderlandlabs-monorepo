import { CFG, RESOURCES } from '../constants';
import { TreeState } from '../../types';
import type { StoreIF } from '@wonderlandlabs/forestry4';
import { TreeStoreData } from '../forestDataStore';
import { PhysicsUtils } from '../PhysicsUtils';

export class TreeController {
  public store: StoreIF<TreeStoreData>;
  public utils: PhysicsUtils;

  constructor(store: StoreIF<TreeState>) {
    this.store = store;
    this.utils = store.res.get(RESOURCES.UTILS);
  }

  scaleTree(oldWidth: number, oldHeight: number, newWidth: number, newHeight: number): void {
    const scaleX = newWidth / oldWidth;
    const scaleY = newHeight / oldHeight;
    const oldCenterX = oldWidth * 0.5;
    const oldCenterY = oldHeight * 0.5;
    const newCenterX = newWidth * 0.5;
    const newCenterY = newHeight * 0.5;

    this.utils.scaleAllPositions(scaleX, scaleY, oldCenterX, oldCenterY, newCenterX, newCenterY);

    this.store.acts.updateSpringLengths(newHeight);
  }
}
