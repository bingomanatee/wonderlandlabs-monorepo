// Examples of using set() method for state updates
// set(path: string | string[], value: any): void

// Basic field updates
setName(name: string) {
  this.set('name', name);  // Updates only the name field
}

setAge(age: number) {
  this.set('age', age);    // Updates only the age field
}

// Deep path updates using dot notation
setTheme(theme: string) {
  this.set('preferences.theme', theme);  // Deep path update
}

setNotificationEnabled(enabled: boolean) {
  this.set('settings.notifications.enabled', enabled);
}

// Array path syntax for complex keys
setUserPreference(key: string, value: any) {
  this.set(['user', 'preferences', key], value);
}

// Multiple single updates (less efficient than mutate)
updateContactInfo(email: string, phone: string) {
  this.set('email', email);
  this.set('phone', phone);
  // Note: For multiple updates, prefer mutate() for better performance
}
