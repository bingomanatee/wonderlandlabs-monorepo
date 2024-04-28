import { ForestIF, TransIF, TransStatusItem } from './types';
type Props = {
    name: string;
    forest: ForestIF;
};
export declare class Trans implements TransIF {
    constructor({ name, forest }: Props);
    id: string;
    name: string;
    forest: ForestIF;
    status: TransStatusItem;
    error?: Error;
    fail(err: Error): void;
    isFailed(): boolean;
}
export {};
