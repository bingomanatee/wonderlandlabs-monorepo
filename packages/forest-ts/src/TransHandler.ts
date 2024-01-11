import { DoProps, TransHandlerIF, TransManagerIF, UpdatePutMsg } from './types/types.tree-and-trans';
import { Unsubscribable } from 'rxjs';

export class TransHandler implements TransHandlerIF {

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
              create: !mgr.tree.has(action.collection, action.identity),
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

  fail(): void {
    this.mgr.remove(this.id, false);
    this._sub.unsubscribe();
  }

}