import { Forest } from '@wonderlandlabs/forestry4';

class CounterStore extends Forest<{ count: number }> {
  increment() {
    this.set('count', this.value.count + 1);
  }

  setCount(count: number) {
    this.set('count', count);
  }
}

const counter = new CounterStore({ value: { count: 0 } });

counter.$bound.increment();
counter.$bound.set('count', 3);

// $ remains available as the short alias.
counter.$.increment();
