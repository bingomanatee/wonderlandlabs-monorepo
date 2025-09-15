const userStore = new Store<UserState>({
  name: 'user-store',
  value: {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
  },
  actions: {
    // Tactical form handler
    onChange: function(value: UserState, event: React.ChangeEvent<HTMLInputElement>) {
      const { name, value: fieldValue, type } = event.target;
      const processedValue = type === 'number' ? parseInt(fieldValue) || 0 : fieldValue;
      this.set(name, processedValue);
    },
    setName: function(value: UserState, name: string) {
      this.set('name', name);
    },
    setAge: function(value: UserState, age: number) {
      this.set('age', age);
    },
    setEmail: function(value: UserState, email: string) {
      this.set('email', email);
    },
    updateProfile: function(value: UserState, profile: Partial<UserState>) {
      this.next({ ...value, ...profile });
    },
    reset: function() {
      this.next({
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      });
    },
  },
  tests: [
    (value: UserState) => value.age < 0 ? 'Age cannot be negative' : null,
    (value: UserState) => value.age > 150 ? 'Age seems unrealistic' : null,
    (value: UserState) => !value.email.includes('@') ? 'Invalid email format' : null,
    (value: UserState) => value.name.length === 0 ? 'Name cannot be empty' : null,
  ],
})
