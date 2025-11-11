// Forestry React Hook Integration Patterns

import React from 'react';
import { useForestryLocal, useObserveForest } from '@/hooks';
import { createUserStore, globalAppStore } from './stores';

// 1. LOCAL STORE MANAGEMENT with useForestryLocal
function UserProfileForm() {
  // Creates and manages a local store instance
  const [userState, userStore] = useForestryLocal(createUserStore);
  
  return (
    <form>
      <input
        value={userState.name}
        onChange={(e) => userStore.$.setName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={userState.email}
        onChange={(e) => userStore.$.setEmail(e.target.value)}
        placeholder="Email"
      />
      <button onClick={() => userStore.$.saveProfile()}>
        Save Profile
      </button>
    </form>
  );
}

// 2. EXTERNAL STORE OBSERVATION with useObserveForest
function AppHeader() {
  // Observes an existing global store
  const appState = useObserveForest(globalAppStore);
  
  return (
    <header>
      <h1>{appState.title}</h1>
      <div>User: {appState.currentUser?.name}</div>
      <div>Theme: {appState.theme}</div>
    </header>
  );
}

// 3. STORE FACTORY PATTERN
function createTodoStore(initialTodos = []) {
  return new TodoStore(initialTodos);
}

function TodoList({ initialTodos }) {
  // Pass initial data to store factory
  const [todoState, todoStore] = useForestryLocal(createTodoStore, initialTodos);
  
  return (
    <div>
      {todoState.todos.map(todo => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => todoStore.$.toggleTodo(todo.id)}
          />
          {todo.text}
        </div>
      ))}
      <button onClick={() => todoStore.$.addTodo('New todo')}>
        Add Todo
      </button>
    </div>
  );
}

// 4. CONDITIONAL STORE CREATION
function ConditionalComponent({ userId }) {
  // Only create store if userId exists
  const storeFactory = userId ? () => createUserStore(userId) : null;
  const [userState, userStore] = useForestryLocal(storeFactory);
  
  if (!userId) return <div>Please log in</div>;
  
  return (
    <div>
      <h2>{userState.name}</h2>
      <button onClick={() => userStore.$.refresh()}>
        Refresh Data
      </button>
    </div>
  );
}

// 5. MULTIPLE STORES IN ONE COMPONENT
function Dashboard() {
  const [userState, userStore] = useForestryLocal(createUserStore);
  const [settingsState, settingsStore] = useForestryLocal(createSettingsStore);
  const [notificationState, notificationStore] = useForestryLocal(createNotificationStore);
  
  return (
    <div>
      <UserPanel state={userState} store={userStore} />
      <SettingsPanel state={settingsState} store={settingsStore} />
      <NotificationPanel state={notificationState} store={notificationStore} />
    </div>
  );
}

// Key Benefits:
// - No prop drilling needed
// - Direct method binding with store.$
// - Automatic re-renders on state changes
// - Type-safe with TypeScript
// - Easy testing with store instances
