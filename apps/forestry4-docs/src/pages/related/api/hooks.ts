import { entry, type ApiSections } from './shared';

export const hooksApi: ApiSections = [
  {
    title: 'Imports and requirements',
    paragraphs: [
      'Import all three hooks and both public types from ' +
      '@wonderlandlabs/forestry4-hooks. React >=18 and Forestry ^4.1.17 are ' +
      'peer dependencies. Call hooks at the top level of React components ' +
      'or custom hooks. Store mutations remain ordinary Forestry operations.',
    ],
  },
  {
    title: 'useObserveForest',
    paragraphs: [],
    methods: [
      entry('useObserveForest<ValueType, OutputType = ValueType>' +
        '(store: Forest<ValueType>, filter?): OutputType',
        'Observe a supplied Forestry Forest. filter is ' +
        '(value: ValueType) => OutputType; omitting it returns the complete ' +
        'value. The initial result is selected from store.value during ' +
        'render. After mounting, the hook reconciles current state and ' +
        'subscribes to later emissions.'),
      entry('Selection equality',
        'Skip updates when Object.is(previous, next) succeeds. Otherwise, ' +
        'non-null, non-array objects are compared by their own enumerable ' +
        'string-key counts and Object.is on each property value. Arrays ' +
        'use reference equality. Prefer primitives or plain object ' +
        'selections; this is not deep equality.'),
      entry('Store and selector changes; cleanup',
        'A new store or filter reference replaces the subscription in an ' +
        'effect and reconciles the selected value. Keep selectors stable ' +
        'when avoiding resubscription matters. Unmount unsubscribes without ' +
        'completing the supplied store. Selector errors are not swallowed.'),
    ],
  },
  {
    title: 'useForestryLocal',
    paragraphs: [],
    methods: [
      entry('useForestryLocal<ValueType, StoreType, Args = []>' +
        '(factory: (...args: Args) => StoreType, ...args: Args): ' +
        '[ValueType, StoreType]',
        'Create component-owned state with a lazy initializer. StoreType ' +
        'extends ForestryLocalStore<ValueType>; Args is a tuple extending ' +
        'unknown[]. The returned tuple contains the current complete value ' +
        'and retained store. There is no selector parameter.'),
      entry('Factory and argument behavior',
        'The committed component retains its initialized store; changing ' +
        'factory or arguments does not recreate it. React may invoke ' +
        'initializers more than once in development Strict Mode, so keep ' +
        'factories free of external side effects. Supply explicit generics ' +
        'when ValueType cannot be inferred from a factory constraint.'),
      entry('Subscriptions and disposal',
        'Subscribe on mount and unsubscribe immediately on cleanup. After ' +
        'a one-second grace period, call complete when no mounted local ' +
        'hook retains that same store. Remounting during the grace period ' +
        'cancels disposal. Counts cover local hooks, not arbitrary external ' +
        'subscribers, so use shared-store hooks for application singletons.'),
      entry('ForestryLocalStore<ValueType>',
        'Structural contract: value: ValueType; subscribe(next): ' +
        '{ unsubscribe?: () => void }; complete(): void. subscribe receives ' +
        'a (nextValue: ValueType) => void callback. A full Forestry Forest ' +
        'satisfies this minimal shape.'),
    ],
  },
  {
    title: 'useForestryGlobal',
    paragraphs: [],
    methods: [
      entry('useForestryGlobal<StoreType, OutputType>' +
        '(source: ForestryGlobalSource<StoreType>, filter?): ' +
        '[OutputType, StoreType]',
        'Read source.singleton, a Forestry Forest, and return selected value ' +
        'plus that store. OutputType defaults to the store value type. ' +
        'filter takes the complete value and returns the selected output. ' +
        'The hook does not create a singleton.'),
      entry('Selection and lifecycle',
        'Delegate observation to useObserveForest, including its equality, ' +
        'resubscription, and error behavior. Unmount unsubscribes without ' +
        'completing the shared store. The application owns its lifetime.'),
      entry('ForestryGlobalSource<StoreType>',
        'Object shape { readonly singleton: StoreType }, where StoreType ' +
        'extends Forest<any>. A class with a static singleton property or ' +
        'a plain source object can satisfy this contract.'),
    ],
  },
];
