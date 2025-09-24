// Vue Store Setup with Forestry
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

// Define the state schema
const UserStateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(18, 'Must be at least 18'),
  isActive: z.boolean(),
});

interface UserState {
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

// Create Forestry store class
class UserStore extends Forest<UserState> {
  constructor() {
    super({
      name: 'user-store',
      value: {
        name: '',
        email: '',
        age: 18,
        isActive: true,
      },
      schema: UserStateSchema,
    });
  }

  // Actions
  updateName(name: string) {
    this.set('name', name);
  }

  updateEmail(email: string) {
    this.set('email', email);
  }

  updateAge(age: number) {
    this.set('age', age);
  }

  toggleActive() {
    this.mutate((draft) => {
      draft.isActive = !draft.isActive;
    });
  }

  // Computed properties
  get isValid(): boolean {
    return this.quality.length === 0;
  }

  get displayName(): string {
    return this.value.name || 'Anonymous User';
  }
}

// Export store instance
export const userStore = new UserStore();
