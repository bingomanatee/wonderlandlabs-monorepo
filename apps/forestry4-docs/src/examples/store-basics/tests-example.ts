import { z } from 'zod';

const ItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    }),
  ),
});

type Items = z.infer
(typeof ItemsSchema);

const config = {
    // ...

    tests(value: Items) {
      for (const item of value.items) {
        if (value.items.filter((p) => p.id === item.id).length > 1) {
          throw new Error(`duplicate items with id = ${item.id}`);
        }
      }
    }

    schema: ItemsSchema,
  }
;
