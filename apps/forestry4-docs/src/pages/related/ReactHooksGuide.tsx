import { Text } from '@chakra-ui/react';
import Section from '../../components/Section';
import CodePanel from '../../components/CodePanel';

export default function ReactHooksGuide() {
  return (
    <>
      <Section
        title="Observe a store"
        id="observe-a-store"
        scrollMarginTop="80px"
      >
        <Text>
          Install alongside Forestry 4 and React 18 or newer.
          useObserveForest(store, filter?) reads the current value and
          subscribes for updates, unsubscribing on cleanup.
        </Text>
        <Text>
          A selector can return just the value a component needs. The hook skips
          updates when selections are Object.is equal or selected record-shaped
          objects have equal own enumerable properties. Prefer primitives or
          plain objects for selections.
        </Text>
        <CodePanel
          language="tsx"
          content={`import { Forest } from '@wonderlandlabs/forestry4';
import { useObserveForest } from '@wonderlandlabs/forestry4-hooks';

const counter = new Forest({ value: { count: 0 } });

export function Counter() {
  const count = useObserveForest(counter, (value) => value.count);
  return (
    <button onClick={() => counter.set('count', count + 1)}>
      {count}
    </button>
  );
}`}
        />
      </Section>
      <Section
        title="Component ownership with useForestryLocal"
        id="component-ownership-with-useforestrylocal"
        scrollMarginTop="80px"
      >
        <Text>
          useForestryLocal(factory, ...args) returns [value, store]. Keep
          factory creation free of external side effects. The hook retains the
          store for the mounted component; changing arguments does not recreate
          it.
        </Text>
        <Text>
          Unmount unsubscribes immediately. After a one-second grace period, the
          hook completes the store if no mounted local hook retains it. Use this
          for component-owned state rather than application singletons.
        </Text>
        <CodePanel
          language="tsx"
          content={`import { Forest } from '@wonderlandlabs/forestry4';
import { useForestryLocal } from '@wonderlandlabs/forestry4-hooks';

const createCounter = (count: number) =>
  new Forest({ value: { count } });

export function LocalCounter() {
  const [value, store] = useForestryLocal<
    { count: number },
    ReturnType<typeof createCounter>,
    [number]
  >(createCounter, 0);
  return (
    <button onClick={() => store.set('count', value.count + 1)}>
      {value.count}
    </button>
  );
}`}
        />
      </Section>
      <Section
        title="Application ownership with useForestryGlobal"
        id="application-ownership-with-useforestryglobal"
        scrollMarginTop="80px"
      >
        <Text>
          useForestryGlobal(source, filter?) accepts an object with a singleton
          property holding the Forest. It returns [value, store] and uses the
          same selection behavior as useObserveForest. Unmount unsubscribes
          without completing the shared store.
        </Text>
        <Text>
          ForestryGlobalSource and ForestryLocalStore are exported types for the
          accepted source and local-store contracts.
        </Text>
        <CodePanel
          language="tsx"
          content={`import { Forest } from '@wonderlandlabs/forestry4';
import { useForestryGlobal } from '@wonderlandlabs/forestry4-hooks';

const source = {
  singleton: new Forest({ value: { count: 0 } }),
};

export function GlobalCounter() {
  const [count, store] = useForestryGlobal(
    source,
    (value) => value.count,
  );
  return (
    <button onClick={() => store.set('count', count + 1)}>
      {count}
    </button>
  );
}`}
        />
      </Section>
    </>
  );
}
