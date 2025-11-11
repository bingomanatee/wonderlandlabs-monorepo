// Tactical Actions - Low-level, reusable utilities
// These handle specific mutations and are called by strategic actions

// Field validation utilities
validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    this.set('errors.email', 'Invalid email format');
    return false;
  }
  this.set('errors.email', null);
  return true;
}

validateRequired(fieldName: string, value: any) {
  if (!value || value.toString().trim() === '') {
    this.set(`errors.${fieldName}`, `${fieldName} is required`);
    return false;
  }
  this.set(`errors.${fieldName}`, null);
  return true;
}

// Data transformation utilities
formatPhoneNumber(phone: string) {
  const cleaned = phone.replace(/\D/g, '');
  const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  this.set('phone', formatted);
}

normalizeUserInput(input: string) {
  return input.trim().toLowerCase();
}

// State management utilities
clearErrors() {
  this.set('errors', {});
}

setLoading(isLoading: boolean) {
  this.set('isLoading', isLoading);
}

setFieldValue(fieldName: string, value: any) {
  this.set(`fields.${fieldName}`, value);
  this.set(`touched.${fieldName}`, true);
}

// Array manipulation utilities
addItem(listName: string, item: any) {
  this.mutate(draft => {
    if (!draft[listName]) draft[listName] = [];
    draft[listName].push(item);
  });
}

removeItem(listName: string, itemId: string) {
  this.mutate(draft => {
    draft[listName] = draft[listName].filter(item => item.id !== itemId);
  });
}
