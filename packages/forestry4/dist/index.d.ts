import { Observable } from 'rxjs';
import { Observer } from 'rxjs';
import { Subject } from 'rxjs';
import { SubjectLike } from 'rxjs';
import { Subscription } from 'rxjs';
import { z } from 'zod';

export declare class Forest<DataType> extends Store<DataType> implements StoreIF<DataType> {
    #private;
    constructor(p: StoreParams<DataType>);
    readonly $path?: Path;
    get $isRoot(): boolean;
    get fullPath(): Path;
    get value(): DataType;
    get $root(): this;
    complete(): DataType;
    next(value: Partial<DataType>): void;
    set(path: Path, value: unknown): void;
    $branch<Type, Subclass extends StoreIF<Type> = StoreIF<Type>>(path: Path, params: StoreParams<Type, Subclass>): Subclass;
    private handleMessage;
    get $subject(): Observable<DataType>;
    subscribe(listener: Listener<DataType>): Subscription;
    receiver: Subject<unknown>;
    $broadcast(message: unknown, fromRoot?: boolean): void;
}

export declare interface ForestMessage {
    type: '$validate-all' | 'validation-failure' | 'validation-complete' | 'complete' | 'set-pending';
    payload?: any;
    branchPath?: Path;
    error?: string;
    timestamp: number;
}

export declare type Listener<DataType> = Partial<Observer<DataType>> | ((value: DataType) => void);

export declare type Path = PathElement[] | string;

declare type PathElement = string;

declare type PendingValue<DataType = unknown> = {
    id: string;
    value: DataType;
    isTransaction: boolean;
    suspendValidation?: boolean;
};

export declare type ResourceMap = Map<string, any>;

/* Excluded from this release type: Store */

export declare interface StoreIF<DataType> {
    $broadcast: (message: unknown, down?: boolean) => void;
    $isRoot: boolean;
    $isValid(value: unknown): boolean;
    $name: string;
    $parent?: StoreIF<unknown> | undefined;
    $path?: Path | undefined;
    $res: Map<string, any>;
    $root: StoreIF<unknown>;
    $schema?: ZodParser;
    $subject: Observable<DataType>;
    $test(value: unknown): Validity;
    $transact(params: TransParams | TransFn<DataType>, suspend?: boolean): void;
    $validate(value: unknown): Validity;
    complete: () => DataType;
    get(path?: Path): any;
    isActive: boolean;
    mutate(producerFn: (draft: DataType) => void, path?: Path): DataType;
    next: (value: Partial<DataType>) => void;
    receiver: SubjectLike<unknown>;
    set(path: Path, value: unknown): void;
    subscribe(listener: Listener<DataType>): Subscription;
    value: DataType;
}

export declare type StoreParams<DataType, SubClass = StoreIF<DataType>> = {
    value: DataType;
    schema?: z.ZodSchema<DataType>;
    tests?: ValueTestFn<DataType> | ValueTestFn<DataType>[];
    prep?: (input: Partial<DataType>, current: DataType) => DataType;
    resources?: ResourceMap;
    name?: string;
    debug?: boolean;
    res?: Map<string, any>;
    path?: Path;
    parent?: StoreIF<unknown>;
    subclass?: new (...args: any[]) => SubClass;
};

declare type TransFn<DataType = unknown> = (value: DataType) => void;

declare type TransParams = {
    action: TransFn;
    suspendValidation?: boolean;
};

export declare type ValidationResult = string | null;

export declare type Validity = {
    isValid: boolean;
    error?: Error;
};

export declare type ValueTestFn<DataType> = (value: unknown, store: StoreIF<DataType>) => null | void | string;

declare type ZodParser = {
    parse: (a: unknown) => unknown;
};

export { }
