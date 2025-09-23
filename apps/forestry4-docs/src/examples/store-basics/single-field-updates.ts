// Modern Forestry 4.1.x class methods for single field updates
setName(name: string) {
  this.set('name', name);  // Updates only the name field
}

setAge(age: number) {
  this.set('age', age);    // Updates only the age field
}

// For nested paths
setTheme(theme: string) {
  this.set('preferences.theme', theme);  // Deep path update
}
