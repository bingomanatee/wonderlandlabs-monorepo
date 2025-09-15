// Create the counter store
const counterStore = new Store({
  name: 'demo-counter',
  value: { count: 0 },
  actions: {
    increment: function(value: { count: number }) {
      this.next({ ...value, count: value.count + 1 });
    },
    decrement: function(value: { count: number }) {
      this.next({ ...value, count: value.count - 1 });
    },
    reset: function() {
      this.next({ count: 0 });
    },
  },
})
