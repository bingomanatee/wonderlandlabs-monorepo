import { Forest } from '@wonderlandlabs/forestry4';

interface UserState {
  name: string;
  age: number;
  email: string;
}

// Modern Forestry 4.1.x class extension pattern
class UserStore extends Forest<UserState> {
  constructor() {
    super({
      name: 'user-store',
      value: {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      },
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
}

const userStore = new UserStore();
export default userStore;
