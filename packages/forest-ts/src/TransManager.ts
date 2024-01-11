import { DoProps, TransHandlerIF, TreeIF } from './types';
import { TransHandler } from './TransHandler';


export default class TransManager {
  private pendingHandlers: TransHandlerIF[] = [];
  private nextHandlerId = 1;

  constructor(public tree: TreeIF) {
  }

  public start(props?: DoProps): TransHandlerIF {
    const handler = new TransHandler(this, this.nextHandlerId, props);
    this.nextHandlerId += 1;
    this.pendingHandlers.push(handler);
    return handler;
  }

  remove(index: number, success: boolean) {
    const remaining: TransHandlerIF[] = [];
    const removed: TransHandlerIF[] = [];
    this.pendingHandlers.forEach((h) => {
      if (h.id >= index) {
        removed.push(h);
      } else {
        remaining.push(h);
      }
    });
    if (!success && remaining.length) {
      this.tree.revert(removed);
    }
  }
}