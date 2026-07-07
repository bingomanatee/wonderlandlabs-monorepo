import { Forest } from '@wonderlandlabs/forestry4';
import type React from 'react';

type FormState = { fields: Record<string, string> };

class FormStore extends Forest<FormState> {
  setField(name: string, value: string) {
    this.set(['fields', name], value);
  }

  setFieldFromEvent(event: React.ChangeEvent<HTMLInputElement>) {
    const name = event.currentTarget.dataset.id;
    if (name) this.setField(name, event.currentTarget.value);
  }
}

<input
  data-id="email"
  value={store.value.fields.email}
  onChange={store.$bound.setFieldFromEvent}
/>;
