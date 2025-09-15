// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/demoStoreFactory.ts
// Description: Universal input handler with type detection
// Last synced: Mon Sep 15 14:19:16 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

      handleInputChange: function (value, event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value: fieldValue, type } = event.target;

        if (type === 'number') {
          const numValue = parseInt(fieldValue) || 0;
          this.set(name, numValue);
        } else {
          this.set(name, fieldValue);
        }
      },
