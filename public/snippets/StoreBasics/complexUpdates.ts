// Use mutate() for complex transformations
actions: {
  addTag: function(value, tag: string) {
    this.mutate(draft => {
      draft.tags.push(tag);  // Immer-powered mutations
    });
  },
  updateNestedSettings: function(value, settings: any) {
    this.mutate(draft => {
      Object.assign(draft.profile.settings, settings);
    }, 'profile');  // Mutate specific path
  }
}
