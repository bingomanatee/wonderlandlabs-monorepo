import { Forest } from '@wonderlandlabs/forestry4';

// Forest factory for the home page counter demo
export const homeDemoStoreFactory = () => new Forest({
  name: 'demo-counter',
  value: { count: 0 },
  actions: {
    increment(value) {
      this.mutate(draft => {
        draft.count += 1;
      });
    },
    decrement(value) {
      this.mutate(draft => {
        draft.count -= 1;
      });
    },
    reset(value) {
      this.mutate(draft => {
        draft.count = 0;
      });
    },
  },
});

export default homeDemoStoreFactory;
