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
