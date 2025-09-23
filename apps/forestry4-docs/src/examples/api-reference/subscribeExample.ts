// Subscribing to Forest Changes
const userStore = new UserForest({
  name: 'John',
  age: 25
});

// Subscribe to all changes
const subscription = userStore.subscribe((value, forest) => {
  console.log('User updated:', value);
  console.log('Forest name:', forest.name);
});

// Make changes - subscriber will be notified
userStore.next({ age: 26 }); // Logs: "User updated: { name: 'John', age: 26 }"
userStore.next({ name: 'Jane' }); // Logs: "User updated: { name: 'Jane', age: 26 }"

// Clean up subscription when done
subscription.unsubscribe();

// Subscribe with error handling
const safeSubscription = userStore.subscribe({
  next: (value) => console.log('Updated:', value),
  error: (error) => console.error('Error:', error),
  complete: () => console.log('Subscription completed')
});
