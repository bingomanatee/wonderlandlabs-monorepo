// Angular Service with Forestry
import { Injectable } from '@angular/core';
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// State interface
interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  newTodoText: string;
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Zod schema for validation
const TodoSchema = z.object({
  id: z.number(),
  text: z.string().min(1, 'Todo text is required'),
  completed: z.boolean(),
});

const TodoStateSchema = z.object({
  todos: z.array(TodoSchema),
  filter: z.enum(['all', 'active', 'completed']),
  newTodoText: z.string(),
});

@Injectable({
  providedIn: 'root'
})
export class TodoService extends Forest<TodoState> {
  constructor() {
    super({
      name: 'todo-service',
      value: {
        todos: [
          { id: 1, text: 'Learn Angular', completed: true },
          { id: 2, text: 'Integrate Forestry', completed: false },
          { id: 3, text: 'Build awesome apps', completed: false },
        ],
        filter: 'all',
        newTodoText: '',
      },
      schema: TodoStateSchema,
    });
  }

  // Observable getters for Angular components
  get todos$(): Observable<Todo[]> {
    return this.$subject.pipe(
      map(state => state.todos)
    );
  }

  get filteredTodos$(): Observable<Todo[]> {
    return this.$subject.pipe(
      map(state => this.getFilteredTodos(state))
    );
  }

  get filter$(): Observable<string> {
    return this.$subject.pipe(
      map(state => state.filter)
    );
  }

  get newTodoText$(): Observable<string> {
    return this.$subject.pipe(
      map(state => state.newTodoText)
    );
  }

  get completedCount$(): Observable<number> {
    return this.$subject.pipe(
      map(state => state.todos.filter(todo => todo.completed).length)
    );
  }

  get activeCount$(): Observable<number> {
    return this.$subject.pipe(
      map(state => state.todos.filter(todo => !todo.completed).length)
    );
  }

  // Actions
  addTodo(): void {
    const text = this.value.newTodoText.trim();
    if (!text) return;

    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    };

    this.mutate(draft => {
      draft.todos.push(newTodo);
      draft.newTodoText = '';
    });
  }

  toggleTodo(id: number): void {
    this.mutate(draft => {
      const todo = draft.todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    });
  }

  removeTodo(id: number): void {
    this.mutate(draft => {
      draft.todos = draft.todos.filter(t => t.id !== id);
    });
  }

  updateNewTodoText(text: string): void {
    this.set('newTodoText', text);
  }

  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.set('filter', filter);
  }

  clearCompleted(): void {
    this.mutate(draft => {
      draft.todos = draft.todos.filter(t => !t.completed);
    });
  }

  // Helper methods
  private getFilteredTodos(state: TodoState): Todo[] {
    switch (state.filter) {
      case 'active':
        return state.todos.filter(todo => !todo.completed);
      case 'completed':
        return state.todos.filter(todo => todo.completed);
      default:
        return state.todos;
    }
  }

  // Validation helpers
  get isNewTodoValid(): boolean {
    return this.value.newTodoText.trim().length > 0;
  }

  get hasCompletedTodos(): boolean {
    return this.value.todos.some(todo => todo.completed);
  }
}
