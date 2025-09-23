import { Forest } from '@wonderlandlabs/forestry4';

interface UserState {
  name: string;
  age: number;
  email: string;
}

class UserStore extends Forest<UserState> {
  constructor() {
    super({
      name: 'user-store',
      value: {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      },
      tests: [
        (value: UserState) => (value.age < 0 ? 'Age cannot be negative' : null),
        (value: UserState) => (value.age > 150 ? 'Age seems unrealistic' : null),
        (value: UserState) => (!value.email.includes('@') ? 'Invalid email format' : null),
        (value: UserState) => (value.name.length === 0 ? 'Name cannot be empty' : null),
      ],
    });
  }

  // Tactical form handler
  onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value: fieldValue, type } = event.target;
    const processedValue = type === 'number' ? parseInt(fieldValue) || 0 : fieldValue;

    this.mutate((draft) => {
      (draft as any)[name] = processedValue;
    });
  }

  setName(name: string) {
    this.mutate((draft) => {
      draft.name = name;
    });
  }

  setAge(age: number) {
    this.mutate((draft) => {
      draft.age = age;
    });
  }

  setEmail(email: string) {
    this.mutate((draft) => {
      draft.email = email;
    });
  }

  updateProfile(profile: Partial<UserState>) {
    this.mutate((draft) => {
      Object.assign(draft, profile);
    });
  }

  reset() {
    this.next({
      name: 'John Doe',
      age: 30,
      email: 'john@example.com',
    });
  }
}

const userStoreFactory = () => new UserStore();
export default userStoreFactory;
