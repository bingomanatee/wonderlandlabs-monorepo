import { Forest, MapCollection } from '../../../src/index';
import { expect, it, describe } from 'vitest';

const MAP_SEED: [string, number][] = [
  [ 'a', 1 ],
  [ 'b', 2 ],
];

describe('MapCollection', () => {
  it('should get values from a map', () => {
    const f = new Forest();
    const mc = new MapCollection<string, number>(
      'foo',
      {
        initial: new Map<string, number>(MAP_SEED),
      },
      f
    );

    expect(mc.get('a')).toBe(1);

    expect(mc.get('c')).toBeUndefined();

    expect(mc.size).toBe(2);
  });

  it('should get values from a map with set', () => {
    const f = new Forest();
    const mc = new MapCollection<string, number>(
      'foo',
      {
        initial: new Map<string, number>([
          [ 'a', 1 ],
          [ 'b', 2 ],
        ]),
      },
      f
    );

    mc.set('c', 30);

    expect(mc.get('a')).toBe(1);

    expect(mc.get('c')).toBe(30);

    expect(mc.size).toBe(3);
  });

  it('should allow keys to be deleted', () => {
    const f = new Forest();
    const mc = new MapCollection<string, number>(
      'foo',
      {
        initial: new Map<string, number>(MAP_SEED),
      },
      f
    );

    mc.set('c', 30);
    mc.delete('a');

    expect(mc.get('b')).toBe(2);

    expect(mc.get('a')).toBeUndefined();

    expect(mc.size).toBe(2);
  });

  it('should respect set overrides', () => {
    const f = new Forest();
    const mc = new MapCollection<string, number>(
      'foo',
      {
        initial: new Map<string, number>([
          [ 'a', 1 ],
          [ 'b', 2 ],
        ]),
      },
      f
    );

    mc.set('a', 30);

    expect(mc.get('a')).toBe(30);
    expect(mc.get('b')).toBe(2);
    expect(mc.size).toBe(2);

    mc.set('a', 5);
    mc.set('b', 10);
    expect(mc.get('a')).toBe(5);
    expect(mc.get('b')).toBe(10);
    expect(mc.size).toBe(2);
  });
  describe('keys', () => {
    it('should ket keys from a map', () => {
      const f = new Forest();
      const mc = new MapCollection<string, number>(
        'foo',
        {
          initial: new Map<string, number>([
            [ 'a', 1 ],
            [ 'b', 2 ],
          ]),
        },
        f
      );

      const keys: string[] = [];

      for (const k of mc.keys()) {
        keys.push(k);
      }
      expect(keys).toEqual([ 'a', 'b' ]);
    });

    it('should get keys from a map with set', () => {
      const f = new Forest();
      const mc = new MapCollection<string, number>(
        'foo',
        {
          initial: new Map<string, number>([
            [ 'a', 1 ],
            [ 'b', 2 ],
          ]),
        },
        f
      );

      mc.set('c', 30);

      const keys: string[] = [];
      for (const k of mc.keys()) {
        keys.push(k);
      }

      expect(keys).toEqual([ 'a', 'b', 'c' ]);

      mc.set('d', 500);

      const keys2: string[] = [];
      for (const k of mc.keys()) {
        keys2.push(k);
      }

      expect(keys2).toEqual([ 'a', 'b', 'c', 'd' ]);
    });

    it('should respect overrides', () => {
      const f = new Forest();
      const mc = new MapCollection<string, number>(
        'foo',
        {
          initial: new Map<string, number>([
            [ 'a', 1 ],
            [ 'b', 2 ],
          ]),
        },
        f
      );

      mc.set('a', 100);

      const keys: string[] = [];
      for (const k of mc.keys()) {
        keys.push(k);
      }

      expect(keys).toEqual([ 'b', 'a' ]);

      mc.set('c', 500);

      const keys2: string[] = [];
      for (const k of mc.keys()) {
        keys2.push(k);
      }

      expect(keys2).toEqual([ 'b', 'a', 'c' ]);
    });
  });

  describe('values', () => {
    it('should get values from a map', () => {
      const f = new Forest();
      const mc = new MapCollection<string, number>(
        'foo',
        {
          initial: new Map<string, number>([
            [ 'a', 1 ],
            [ 'b', 2 ],
          ]),
        },
        f
      );

      const values: number[] = [];

      for (const k of mc.values()) {
        values.push(k);
      }
      expect(values).toEqual([ 1, 2 ]);
    });

    it('should get values from a map with set', () => {
      const f = new Forest();
      const mc = new MapCollection<string, number>(
        'foo',
        {
          initial: new Map<string, number>([
            [ 'a', 1 ],
            [ 'b', 2 ],
          ]),
        },
        f
      );

      mc.set('c', 30);

      const values: number[] = [];
      for (const k of mc.values()) {
        values.push(k);
      }

      expect(values).toEqual([ 1, 2, 30 ]);

      mc.set('d', 100);

      const values2: number[] = [];
      for (const k of mc.values()) {
        values2.push(k);
      }

      expect(values2).toEqual([ 1, 2, 30, 100 ]);
    });

    it('should get respect overrides', () => {
      const f = new Forest();
      const mc = new MapCollection<string, number>(
        'foo',
        {
          initial: new Map<string, number>([
            [ 'a', 1 ],
            [ 'b', 2 ],
          ]),
        },
        f
      );

      mc.set('a', 30);

      const values: number[] = [];
      for (const k of mc.values()) {
        values.push(k);
      }

      expect(values).toEqual([ 2, 30 ]);

      mc.set('d', 100);

      const values2: number[] = [];
      for (const k of mc.values()) {
        values2.push(k);
      }

      expect(values2).toEqual([ 2, 30, 100 ]);
    });
  });

  describe('iterator/clone', () => {
    it('iterates after set', () => {
      const f = new Forest();
      const mc = new MapCollection<string, number>(
        'foo',
        {
          initial: new Map<string, number>(MAP_SEED),
        },
        f
      );

      mc.set('c', 3); // force a proxy;

      const clone = new Map(mc.value);

      const extendedSeed: [string, number][] = [ ...MAP_SEED, [ 'c', 3 ] ];
      expect(clone).toEqual(new Map<string, number>(extendedSeed));
    });
    it('iterates after set and delete', () => {
      const f = new Forest();
      const mc = new MapCollection<string, number>(
        'foo',
        {
          initial: new Map<string, number>(MAP_SEED),
        },
        f
      );

      mc.set('c', 30); // force a proxy;
      mc.delete('a');

      const clone = new Map(mc.value);

      const extendedSeed: [string, number][] = [
        [ 'b', 2 ],
        [ 'c', 30 ],
      ];
      expect(clone).toEqual(new Map<string, number>(extendedSeed));
    });
  });
});
