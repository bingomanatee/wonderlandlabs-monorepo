// Branch Synchronization - How branches stay in sync with parents
import { Forest } from '@wonderlandlabs/forestry4';

interface AppState {
  user: { name: string; email: string };
  settings: { theme: string; notifications: boolean };
  counter: number;
}

const app = new Forest<AppState>({
  value: {
    user: { name: 'John', email: 'john@example.com' },
    settings: { theme: 'light', notifications: true },
    counter: 0
  },
  name: 'app'
});

// Create branches
const userBranch = app.$branch(['user'], {});
const settingsBranch = app.$branch(['settings'], {});

// Set up listeners to observe synchronization
console.log('=== Initial State ===');
console.log('App user:', app.value.user);
console.log('User branch:', userBranch.value);

// Subscribe to changes
userBranch.subscribe(value => {
  console.log('User branch updated:', value);
});

app.subscribe(value => {
  console.log('App updated:', value.user);
});

console.log('\n=== Update through parent ===');
// Update through parent - branch receives update
app.mutate(draft => {
  draft.user.name = 'Jane';
  draft.user.email = 'jane@example.com';
});

console.log('\n=== Update through branch ===');
// Update through branch - parent receives update
userBranch.mutate(draft => {
  draft.name = 'Bob';
});

console.log('\n=== Multiple branch updates ===');
// Multiple branches can coexist and sync independently
settingsBranch.mutate(draft => {
  draft.theme = 'dark';
});

// Parent updates don't affect unrelated branches
app.mutate(draft => {
  draft.counter = 42;
});

console.log('Final app state:', app.value);
console.log('Final user branch:', userBranch.value);
console.log('Final settings branch:', settingsBranch.value);

// Demonstrate path-based updates
console.log('\n=== Path-based updates ===');
app.set('user.name', 'Alice');
console.log('User branch after path update:', userBranch.value.name); // 'Alice'
