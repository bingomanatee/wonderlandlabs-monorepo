import { Forest } from '@wonderlandlabs/forestry4';
import type React from 'react';

type Todo = { id: string; text: string; done: boolean };
type TodoState = { todos: Todo[] };

class TodoStore extends Forest<TodoState> {
  toggle(id: string) {
    this.mutate((draft) => {
      const todo = draft.todos.find((item) => item.id === id);
      if (todo) todo.done = !todo.done;
    });
  }

  toggleFromEvent(event: React.MouseEvent<HTMLElement>) {
    const id = event.currentTarget.dataset.id;
    if (id) this.toggle(id);
  }
}

function TodoList({ store }: { store: TodoStore }) {
  return store.value.todos.map((todo) => (
    <button
      key={todo.id}
      data-id={todo.id}
      onClick={store.$bound.toggleFromEvent}
    >
      {todo.text}
    </button>
  ));
}
