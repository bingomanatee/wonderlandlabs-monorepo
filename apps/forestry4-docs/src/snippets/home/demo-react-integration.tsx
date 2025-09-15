// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/demo-react-integration.tsx
// Description: Demo React integration for home page live demo
// Last synced: Sun Sep 14 22:42:19 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// React component using the store
const [count, setCount] = useState(0)
const [store, setStore] = useState<Store<{ count: number }> | null>(null)

useEffect(() => {
  // Subscribe to store changes
  const subscription = counterStore.subscribe((value) => {
    setCount(value.count)
  })

  setStore(counterStore)

  return () => {
    subscription.unsubscribe()
  }
}, [])

// Button handlers
const handleIncrement = () => store?.$.increment()
const handleDecrement = () => store?.$.decrement()
const handleReset = () => store?.$.reset()
