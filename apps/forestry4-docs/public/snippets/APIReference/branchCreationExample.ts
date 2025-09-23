// Auto-generated snippet from: apps/forestry4-docs/src/examples/api-reference/branchCreationExample.ts
// Description: Forest branch() method examples for creating branches with actions
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Branch Creation Example
const userStore = new UserForest({
  name: 'John',
  profile: {
    age: 25,
    preferences: {
      theme: 'dark',
      notifications: true,
    },
  },
});

// Create a branch for profile management
const profileBranch = userStore.$branch('profile', {
  actions: {
    updateAge(newAge) {
      this.set('age', newAge);
    },

    toggleTheme(value) {
      const newTheme = value.preferences.theme === 'dark' ? 'light' : 'dark';
      this.set('preferences.theme', newTheme);
    },
  },

  tests(value) {
    if (!(value.age >= 0 && value.age <= 150)) {
      return `Age ${value.age} is out of range`;
    }

  });

// Use branch actions
profileBranch.updateAge(26);
profileBranch.toggleTheme();

// Branch has its own subscription
profileBranch.subscribe((profileValue) => {
  console.log('Profile updated:', profileValue);
});
