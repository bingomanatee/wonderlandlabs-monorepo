import { ResConfig, Resource, ResourceKey } from './types';
import { CanDI } from './CanDI';
/**
 * this is a value stored in the can's registry.
 * It is assumed that once set, this instance is never replaced --
 * that is, its resource may be replaced, but it as instance is not.
 *
 *
 */
export declare class ResourceObj implements Resource {
    private can;
    private name;
    readonly config: ResConfig;
    constructor(can: CanDI, name: ResourceKey, resource: any, config: ResConfig);
    private calcComp;
    private listenForValue;
    get hasDeps(): boolean;
    private _resource;
    get resource(): any;
    set resource(value: any);
    private _promise;
    get pending(): boolean | undefined;
    private added?;
    private computed;
    private __value;
    private get _value();
    private set _value(value);
    private get type();
    private get isFinal();
    private get isComputeOnce();
    /**
     * returns the value of the dependencies (if any) mapped out from can.
     * It's an "all or nothing" approach -- unless the can has ALL the required resources
     * an array of undefined values are returned.
     * @private
     */
    private get deps();
    private get args();
    /**
     * returns the resource as a function; note -- this will not ALWAYS be rational;
     * should only be called when the type is known to be 'func' or 'comp'.
     *
     * Note: the arguments are spread from
     * (1) the dependencies pulled from the can, if any
     * (2) the config args, if any
     * (3) any inputs passed into the calculator, if any
     *
     * so, the resource needs to be able to accept the arguments with the proper offset
     * based on the count of parameters derived from these values.
     *
     * It's advised to use either dynamic params passed to the calculator
     * OR hard-coded args form the config;
     *
     * if you use both, take care.
     *
     * @private
     */
    private get calculator();
    get value(): any;
    private _computeSub?;
    /**
     * clears the computed registry if a dependency is added / updated
     * @private
     */
    private invalidateOnAddition;
}
