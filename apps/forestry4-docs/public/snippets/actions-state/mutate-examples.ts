// Examples of using mutate() method for complex state updates
// mutate(updater: (draft: T) => void | T): void

// Adding items to arrays
addTag(tag: string) {
  this.mutate(draft => {
    if (!draft.tags) draft.tags = [];
    draft.tags.push(tag);  // Immer-powered mutations
  });
}

// Removing items from arrays
removeTag(tagToRemove: string) {
  this.mutate(draft => {
    draft.tags = draft.tags.filter(tag => tag !== tagToRemove);
  });
}

// Complex nested object updates
updateNestedPreference(key: string, value: any) {
  this.mutate(draft => {
    if (!draft.preferences) draft.preferences = {};
    draft.preferences[key] = value;
  });
}

// Multiple field updates in one operation
updateProfile(updates: Partial<UserState>) {
  this.mutate(draft => {
    Object.assign(draft, updates);  // Merge multiple fields efficiently
  });
}

// Complex transformations
processOrder(orderId: string, status: 'pending' | 'completed' | 'cancelled') {
  this.mutate(draft => {
    const order = draft.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      
      // Update counters
      if (status === 'completed') {
        draft.stats.completedOrders++;
      }
    }
  });
}
