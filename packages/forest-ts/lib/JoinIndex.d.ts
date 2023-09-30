import { TreeClass } from './TreeClass';
import { JoinSchema, QueryDefJoin } from './types';
import CollectionClass from './CollectionClass';
export default class JoinIndex {
    tree: TreeClass;
    joinName: string;
    constructor(tree: TreeClass, joinName: string);
    clearCache(): void;
    get join(): JoinSchema;
    fromIndex: Map<any, any>;
    toIndex: Map<any, any>;
    private isGenerated;
    private _index;
    get fromColl(): CollectionClass;
    get toColl(): CollectionClass;
    private generateFromFieldToToField;
    generate(): void;
    private generateFromFieldToToId;
    private generateFromIdToToField;
    private generateFromIdToToId;
    toLeafsFor(id: any, join?: QueryDefJoin): any;
    fromLeafsFor(id: any, join?: QueryDefJoin): any;
}
