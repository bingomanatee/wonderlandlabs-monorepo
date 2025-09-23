import { Forest } from '@wonderlandlabs/Forestry4';
import type { ForestConfig } from '@wonderlandlabs/forestry4';

type Item = {
  id: number;
  name: string;
};
type Items = {
  items: Item[];
};
export default class MyStore extends Forest<Items> {
  constructor() {
    // update / mutate config
    super({
      value: { items: [] },
    });
  }

  addItem(item: Item) {
    this.mutate((value) => {
      value.items.push(item);
    });
  }

  get count() {
    return this.value.items.length;
  }
}
