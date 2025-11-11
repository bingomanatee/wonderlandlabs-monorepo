// Examples of using next() method for complete state replacement
// next(value: T): void

// Complete state reset
reset() {
  this.next({  // Replace entire state value
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    preferences: {
      theme: 'light',
      notifications: true
    }
  });
}

// Loading new data from API
loadUserData(userData: UserState) {
  this.next(userData);  // Replace entire state with API response
}

// State initialization
initialize(initialState: UserState) {
  this.next(initialState);  // Set initial state
}

// Bulk replacement (use sparingly)
replaceAllSettings(newSettings: SettingsState) {
  this.next(newSettings);
  // Note: This replaces the ENTIRE state, losing any existing data
  // Prefer set() or mutate() for partial updates
}

// Factory reset functionality
factoryReset() {
  this.next(this.getDefaultState());  // Reset to default values
}
