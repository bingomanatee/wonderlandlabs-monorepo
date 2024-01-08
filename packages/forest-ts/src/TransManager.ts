import { DoProps, TransHandlerIF, TransManagerIF, TreeIF, UpdatePutMsg } from './types';
import { Unsubscribable } from 'rxjs';


class TransHandler implements TransHandlerIF {

  public puts: UpdatePutMsg[] = []; // a list of all actions that happen between creation and completiion.
  private _sub: Unsubscribable;

  constructor(public mgr: TransManagerIF, public id: number, public props?: DoProps) {
    const self = this;
    this._sub = mgr.tree.updates.subscribe({
      next(action) {
        if (action.action === 'put-data' && action.collection) {
          if (mgr.tree.has(action.collection, action.identity)) {
            self.puts.push({
              ...action,
              prev: mgr.tree.get(action.collection, action.identity)
            } as UpdatePutMsg);
          } else {
            self.puts.push(action as UpdatePutMsg);
          }
        }
      }
    });
  }

  complete(): void {
    this.mgr.remove(this.id, true);
    this._sub.unsubscribe();
  }

  fail(_err: Error): void {
    this.mgr.remove(this.id, false);
    this._sub.unsubscribe();
  }

}

export default class TransManager {
  private pendingHandlers: TransHandlerIF[] = [];
  private nextHandlerId = 1;

  constructor(public tree: TreeIF) {
  }

  public start(props: DoProps): TransHandlerIF {
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