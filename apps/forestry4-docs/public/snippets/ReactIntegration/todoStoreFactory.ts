// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/createTodoStore.ts
// Description: Todo Store Factory - Complete todo app store implementation
// Last synced: Mon Sep 23 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

const MAX_LENGTH = 100;
// Zod schemas for runtime validation
const TodoItemSchema = z.object({
  id: z.number().positive('Todo ID must be positive'),
  text: z.string().min(1, 'Todo text cannot be empty').max(MAX_LENGTH, 'Todo text too long'),
  completed: z.boolean(),
});

const TodoStateSchema = z.object({
  todos: z.array(TodoItemSchema).max(100, 'Too many todos'),
  filter: z.enum(['all', 'active', 'completed']),
  newTodoText: z.string().max(200, 'New todo text too long'),
});

// TypeScript interfaces derived from Zod schemas
interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

export interface TodoState {
  todos: TodoItem[];
  filter: 'all' | 'active' | 'completed';
  newTodoText: string;
}

function s(t: string) {
  if (typeof t !== 'string') {
    return '';
  }
  return t.trim().toLocaleLowerCase();
}

// Modern Forestry 4.1.x class extension pattern
class TodoForest extends Forest<TodoState> {
  constructor() {
    const initialTodos = [
      { id: 1, text: 'Learn Forestry 4', completed: true },
      { id: 2, text: 'Build a React app', completed: false },
      { id: 3, text: 'Master state management', completed: false },
    ];

    super({
      name: 'todo-app',
      value: {
        todos: initialTodos,
        filter: 'all',
        newTodoText: '',
      },
      // Use Zod schema for comprehensive validation
      schema: TodoStateSchema,
      tests: [
        // Additional custom validation beyond schema
        (value: TodoState) => {
          const duplicateTexts = value.todos
            .map((todo) => todo.text.toLowerCase())
            .filter((text, index, arr) => arr.indexOf(text) !== index);

          return duplicateTexts.length > 0
            ? `Duplicate todos found: ${duplicateTexts.join(', ')}`
            : null;
        },
      ],
    });
  }

  get newTodoTextIsValid() {
    return !this.newTodoErrors;
  }

  get newTodoErrors() {
    if (this.value.todos.find((todo: TodoItem) => s(todo.text) === s(this.value.newTodoText))) {
      return 'Todo exists in collection';
    }
    const { newTodoText } = this.value;
    if (newTodoText.length > MAX_LENGTH) {
      return `Todo too long (${newTodoText.length} chars, ${newTodoText.length - MAX_LENGTH} over)`;
    }
    return '';
  }

  // Compute filtered todos based on current filter
  get filteredTodos(): TodoItem[] {
    const value = this.value;
    switch (value.filter) {
      case 'active':
        return value.todos.filter((todo) => !todo.completed);
      case 'completed':
        return value.todos.filter((todo) => todo.completed);
      default:
        return value.todos;
    }
  }

  // Compute completed todos count
  get completedCount(): number {
    return this.value.todos.filter((todo) => todo.completed).length;
  }

  // Compute active todos count
  get activeCount(): number {
    return this.value.todos.filter((todo) => !todo.completed).length;
  }

  // Check if add button should be disabled
  isAddDisabled(): boolean {
    return !this.value.newTodoText.trim();
  }

  // Action methods for onClick handlers
  setFilterAll() {
    this.setFilter('all');
  }

  setFilterActive() {
    this.setFilter('active');
  }

  setFilterCompleted() {
    this.setFilter('completed');
  }

  // Handle Enter key press in input
  handleKeyPress(event: React.KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addTodo();
    }
  }

  // Create bound toggle function for specific todo
  createToggleTodo(id: number) {
    return () => this.toggleTodo(id);
  }

  // Create bound remove function for specific todo
  createRemoveTodo(id: number) {
    return () => this.removeTodo(id);
  }

  // Tactical form handler using event target name
  onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value: fieldValue } = event.target;
    this.set(name, fieldValue);
  }

  // Add new todo with validation
  addTodo() {
    const value = this.value;
    if (!value.newTodoText.trim()) {
      return;
    }

    // Validate the new todo item before adding
    const newTodo: TodoItem = {
      id: Date.now(),
      text: value.newTodoText.trim(),
      completed: false,
    };

    // Validate individual todo item
    const todoValidation = TodoItemSchema.safeParse(newTodo);
    if (!todoValidation.success) {
      console.error('Invalid todo item:', todoValidation.error.issues);
      return;
    }

    this.mutate((draft) => {
      draft.todos.push(newTodo);
      draft.newTodoText = '';
    });
    // Note: The schema validation for the entire state happens automatically
    // through Forestry's validation system after the mutation
  }

  // Toggle todo completion
  toggleTodo(id: number) {
    const updatedTodos = this.value.todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.set('todos', updatedTodos);
  }

  // Remove todo
  removeTodo(id: number) {
    const filteredTodos = this.value.todos.filter((todo) => todo.id !== id);
    this.set('todos', filteredTodos);
  }

  // Set filter
  setFilter(filter: 'all' | 'active' | 'completed') {
    this.set('filter', filter);
  }

  // Clear completed todos
  clearCompleted() {
    const activeTodos = this.value.todos.filter((todo) => !todo.completed);
    this.set('todos', activeTodos);
  }
}

// Forest factory function for useForestryLocal
export const createTodoStore = () => {
  return new TodoForest();
};
