import { filter, first, firstValueFrom, map, Observable, Subject, timeout } from 'rxjs'
import { ResConfig, Resource, ResourceKey, ResourceType } from './types';
import { ResourceObj } from './ResourceObj'

type ResDef = { name: ResourceKey, value: any, config?: ResConfig, type?: ResourceType }

/**
 * tracks resources added, with defined dependencies, an optional list of registry names.
 * note - resources are added immediately on the call of "set" -- however
 * if they have undefined dependencies, they are "pending"
 * -- their value will be undefined
 * until the dependencies are resolved.
 */
export class CanDI {
  public registry = new Map<ResourceKey, Resource>();
  public loadStream = new Subject<ResourceKey>();

  constructor(values?: ResDef[]) {
    values?.forEach((val) => {
      const resource = val.value;
      const config = val.config || val.type;
      if (config) {
        this.set(val.name, resource, config);
      }
    })
  }

  public set(name: ResourceKey, resource: any, config?: ResConfig | ResourceType): CanDI {
    if (this.registry.has(name)) {
      const dep = this.registry.get(name)!;
      dep.resource = resource; // will throw if config.constant === false
      this.loadStream.next(name);
      return this;
    }

    if (!config) {
      config = { type: 'value' };
    } else if (typeof config === 'string') {
      config = { type: config };
    }

    if (!['comp', 'func', 'value'].includes(config.type)) {
      throw new Error('unknown type  for ' + name + ': ' + config.type)
    }

    /**
     * at this point two things are true:
     1: this is the first time the resource has been defined (it's not in the registry yet)
     2: the config is a defined ResConfig object
     3: the config is one of the accepted resource types
     */

    this.registry.set(name, new ResourceObj(this, name, resource, config));
    this.loadStream.next(name);
    return this;
  }

  /**
   * returns the value of the resource(s); note, this is an async method.
   * @param name
   * @param time
   */
  public async get(name: ResourceKey | ResourceKey[], time?: number): Promise<any> {
    if (this.has(name)) {
      return this.value(name);
    }
    return firstValueFrom(this.when(name, time))
  }

  /**
   * this is a synchronous retrieval function. it returns the value
   * of the resource IF it has been set, AND its dependencies have been resolved.
   *
   * @param name
   */
  public value(name: ResourceKey | ResourceKey[]): any {

    try {
      if (Array.isArray(name)) {
        return name.map((subName) => this.value(subName));
      }

      if (!this.registry.has(name)) {
        return undefined;
      }
      const reg = this.registry.get(name)!;

      return reg.pending ? undefined : reg.value;
    } catch (err) {
      console.log('---- value error:', err);
      return undefined
    }
  }

  public has(name: ResourceKey | ResourceKey[]): boolean {
    if (Array.isArray(name)) {
      return name.every((subName) => this.has(subName));
    }
    if (!this.registry.has(name)) {
      return false;
    }
    return !this.registry.get(name)!.pending;
  }

  public when(deps: ResourceKey | ResourceKey[], maxTime = 0) {
    if ((typeof maxTime !== 'undefined') && maxTime >= 0) {
      return this.observe(deps)
        .pipe(
          first(),
          timeout(maxTime + 1),
          map((valueSet) => {
            return Array.isArray(deps) ? valueSet : valueSet[0]
          })
        )
    }
    return this.observe(deps).pipe(first(), map((valueSet) => {
      return Array.isArray(deps) ? valueSet : valueSet[0]
    }));
  }

  observe(name: string | string[]): Observable<any[]> {
    const nameArray = Array.isArray(name) ? name : [name];
    return this.loadStream.pipe(
      filter((loadedName) => nameArray.includes(loadedName)),
      filter(() => this.has(nameArray)),
      map(() => {
        return this.value(nameArray);
      })
    )
  }

}
