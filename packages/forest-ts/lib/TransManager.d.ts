import { DoProps, TransHandlerIF, TreeIF } from './types';
export default class TransManager {
    tree: TreeIF;
    private pendingHandlers;
    private nextHandlerId;
    constructor(tree: TreeIF);
    start(props?: DoProps): TransHandlerIF;
    remove(index: number, success: boolean): void;
}
