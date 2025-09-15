// Tactical form handler using event target name
actions: {
  onChange: function(value, event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value: fieldValue, type } = event.target;
    const processedValue = type === 'number' ? parseInt(fieldValue) || 0 : fieldValue;
    this.set(name, processedValue);  // Uses field name to update correct property
  }
}

// Usage in JSX - actions are pre-bound, no wrapper needed:
<Input name="age" type="number" value={state.age} onChange={store.$.onChange} />
<Input name="email" value={state.email} onChange={store.$.onChange} />
