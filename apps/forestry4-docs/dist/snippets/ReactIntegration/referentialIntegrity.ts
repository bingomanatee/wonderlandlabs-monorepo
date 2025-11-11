// Referential Integrity with Immer in Forestry

// ✅ SAFE: Forestry ensures referential integrity through Immer
function UserProfile() {
  const [userState, userStore] = useForestryLocal(createUserStore);
  
  // This useEffect will ONLY run when user.preferences actually changes
  useEffect(() => {
    console.log('User preferences changed:', userState.preferences);
    // Safe to use userState.preferences as dependency
  }, [userState.preferences]);
  
  // This useEffect will ONLY run when the user's name changes
  useEffect(() => {
    document.title = `Profile: ${userState.name}`;
  }, [userState.name]);
  
  return (
    <div>
      <h1>{userState.name}</h1>
      <p>Theme: {userState.preferences.theme}</p>
    </div>
  );
}

// ❌ PROBLEMATIC: Manual state management can break referential integrity
function ManualStateExample() {
  const [user, setUser] = useState({
    name: 'John',
    preferences: { theme: 'dark' }
  });
  
  const updateTheme = (newTheme) => {
    // DANGER: This mutates the existing object!
    user.preferences.theme = newTheme;
    setUser(user); // React won't detect this change!
    
    // Even this "safer" approach can have issues:
    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        theme: newTheme
      }
    });
    // What if you forget to spread user.preferences? Silent bugs!
  };
  
  // This useEffect might not run when expected due to referential issues
  useEffect(() => {
    console.log('Preferences changed?', user.preferences);
  }, [user.preferences]); // Might not trigger correctly
}

// ✅ FORESTRY SOLUTION: Automatic referential integrity
class UserStore extends Forest<UserState> {
  updateTheme(newTheme: string) {
    // Immer ensures this creates a new reference
    this.set('preferences.theme', newTheme);
    // OR
    this.mutate(draft => {
      draft.preferences.theme = newTheme; // Safe mutation via Immer
    });
  }
}

// Key Benefits:
// 1. Every state change creates new references for changed paths
// 2. Unchanged parts of state keep the same reference (performance)
// 3. useEffect dependencies work reliably
// 4. No manual spreading or deep cloning needed
// 5. Eliminates entire class of referential integrity bugs
