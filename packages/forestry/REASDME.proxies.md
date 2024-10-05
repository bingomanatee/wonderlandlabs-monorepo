# Proxies

Proxies are extermely memory efficient mutations that can reutrn "augmented" versions of complex objexts 
with a flat overhead that doesn't change significantly. For instance you can proxy a Map by "setting"
a single key/value item; you write interceptors to methods like `size()`, `keys()`... etc to take into account
the new entry, and the proxy is in effect a new object that reflects the new entry. 

For instance the most common method in Map is the `get(key): value | undefined` method. 

here is a fragment of the proxy factory for `setProxyFor`: 

```
function getter<KeyType, ValueType>(
  target: MapSetInfo<KeyType, ValueType>,
  key: KeyType
) {
  return key === target.key ? target.value : target.map.get(key);
}
// ....

export function setProxyFor<KeyType = unknown, ValueType = unknown>(
  target: MapSetInfo<KeyType, ValueType>
) {
  const handler = {

    get(
      target: MapSetInfo<KeyType, ValueType>,
      method: keyof typeof target.map
    ) {
      let out: any = undefined;
      switch (method) {
      case 'get':
        out = (key: KeyType) => getter<KeyType, ValueType>(target, key);
        break;
        ...
      }
    }
  }
  return new Proxy(target, handler) as Map<KeyType, ValueType>;

};

```

as you can see it basically says, "we've set a single key - return that value if the key is 
asked for, otherwise return the target's `get(key)` result. 

Making each change of the map mutator produce a proxy means that you end up rolling forward a heavily 
wrapped proxy that returns the values of the frequently changed keys relatively fast, but is slightly 
slower for the unchanged keys of the original "initial" map. The gain is that the net memory burden
of the entire $tree is much smaller than it would be if each branch had a brand new copy of the map - 
it would cost `(branch x keys) x averge key and value size` to store the entire history. 
Storing a nested proxy in the local cache, on the other hand, adds nearly no extra memory overhead 
per extra branch - just enough to maintain the storage and closure of the proxy factory. 

## Proxies and caching

