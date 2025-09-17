// Use set() for single field updates - most efficient
actions: {
  setName: function(value, name: string) {
    this.set('name', name);  // Updates only the $name field
  },
  setAge: function(value, age: number) {
    this.set('age', age);    // Updates only the age field
  },
  // For nested paths
  setTheme: function(value, theme: string) {
    this.set('preferences.theme', theme);  // Deep $path update
  }
}
