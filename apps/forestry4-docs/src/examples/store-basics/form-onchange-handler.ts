// Modern Forestry 4.1.x class method for tactical form handling
onChange(event: React.ChangeEvent<HTMLInputElement>) {
  const { name, value: fieldValue, type } = event.target;
  const processedValue = type === 'number' ? parseInt(fieldValue) || 0 : fieldValue;
  
  this.mutate(draft => {
    (draft as any)[name] = processedValue;  // Uses field name to update correct property
  });
}

// Usage in JSX - methods are pre-bound via $, no wrapper needed:
<Input name="age" type="number" value={state.age} onChange={store.$.onChange} />
<Input name="email" value={state.email} onChange={store.$.onChange} />
