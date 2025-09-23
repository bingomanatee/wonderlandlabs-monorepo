// Auto-generated snippet from: apps/forestry4-docs/src/examples/store-basics/tests-example.ts
// Description: Validation tests configuration example
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

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
