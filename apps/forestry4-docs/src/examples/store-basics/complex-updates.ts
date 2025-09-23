// Use mutate() for complex transformations
addTag(tag: string) {
  this.mutate(draft => {
    if (!draft.tags) draft.tags = [];
    draft.tags.push(tag);  // Immer-powered mutations
  });
}

removeTag(tagToRemove: string) {
  this.mutate(draft => {
    draft.tags = draft.tags.filter(tag => tag !== tagToRemove);
  });
}

updateNestedPreference(key: string, value: any) {
  this.mutate(draft => {
    if (!draft.preferences) draft.preferences = {};
    draft.preferences[key] = value;
  });
}
