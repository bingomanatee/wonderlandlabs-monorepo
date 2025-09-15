const [userState, setUserState] = useState<UserState>({ name: '', age: 0, email: '' })
const [error, setError] = useState('')

useEffect(() => {
  const subscription = userStore.subscribe((state) => {
    setUserState(state)
    setError('')
  })

  return () => {
    subscription.unsubscribe()
  }
}, [])

// No separate form state needed - store handles everything!
