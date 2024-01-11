import { DoProps, TransHandlerIF, TransManagerIF, UpdatePutMsg } from './types/types.tree-and-trans';
export declare class TransHandler implements TransHandlerIF {
    mgr: TransManagerIF;
    id: number;
    props?: DoProps | undefined;
    puts: UpdatePutMsg[];
    private _sub;
    constructor(mgr: TransManagerIF, id: number, props?: DoProps | undefined);
    complete(): void;
    fail(): void;
}
