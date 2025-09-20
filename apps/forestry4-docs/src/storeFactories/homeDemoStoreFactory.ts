import { Forest } from '@wonderlandlabs/forestry4';

// Modern Forestry 4.1.x class extension pattern
class HomeDemoForest extends Forest<{ count: number }> {
  constructor() {
    super({
      name: 'demo-counter',
      value: { count: 0 },
    });
  }

  increment() {
    this.mutate(draft => {
      draft.count += 1;
    });
  }

  decrement() {
    this.mutate(draft => {
      draft.count -= 1;
    });
  }

  reset() {
    this.mutate(draft => {
      draft.count = 0;
    });
  }
}

// Forest factory for the home page counter demo
export const homeDemoStoreFactory = () => new HomeDemoForest();

export default homeDemoStoreFactory;
