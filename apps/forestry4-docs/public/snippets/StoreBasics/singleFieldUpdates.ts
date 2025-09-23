// Auto-generated snippet from: apps/forestry4-docs/src/examples/store-basics/single-field-updates.ts
// Description: Single field update patterns with modern class methods
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

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
