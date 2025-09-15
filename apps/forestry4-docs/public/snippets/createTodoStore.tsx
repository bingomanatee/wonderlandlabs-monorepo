// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/createTodoStore.tsx
// Description: Todo store factory from createTodoStore
// Last synced: Mon Sep 15 12:00:11 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import { Forest } from '@wonderlandlabs/forestry4';

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

// Forest factory function for useForestryLocal
export const createTodoStore = () => {
  const initialTodos = [
    { id: 1, text: 'Learn Forestry 4', completed: true },
    { id: 2, text: 'Build a React app', completed: false },
    { id: 3, text: 'Master state management', completed: false },
  ];

  return new Forest<TodoState>({
    name: 'todo-app',
    value: {
      todos: initialTodos,
      filter: 'all',
      newTodoText: '',
    },
    actions: {
      // Compute filtered todos based on current filter
      filteredTodos: function (value: TodoState): TodoItem[] {
        switch (value.filter) {
          case 'active':
            return value.todos.filter((todo) => !todo.completed);
          case 'completed':
            return value.todos.filter((todo) => todo.completed);
          default:
            return value.todos;
        }
      },

      // Compute completed todos count
      completedCount: function (value: TodoState): number {
        return value.todos.filter((todo) => todo.completed).length;
      },

      // Compute active todos count
      activeCount: function (value: TodoState): number {
        return value.todos.filter((todo) => !todo.completed).length;
      },

      // Check if add button should be disabled
      isAddDisabled: function (value: TodoState): boolean {
        return !value.newTodoText.trim();
      },

      // Action methods for onClick handlers
      setFilterAll: function (value: TodoState) {
        this.$.setFilter('all');
      },

      setFilterActive: function (value: TodoState) {
        this.$.setFilter('active');
      },

      setFilterCompleted: function (value: TodoState) {
        this.$.setFilter('completed');
      },

      // Handle Enter key press in input
      handleKeyPress: function (value: TodoState, event: React.KeyboardEvent) {
        if (event.key === 'Enter') {
          this.$.addTodo();
        }
      },

      // Create bound toggle function for specific todo
      createToggleTodo: function (value: TodoState, id: number) {
        return () => this.$.toggleTodo(id);
      },

      // Create bound remove function for specific todo
      createRemoveTodo: function (value: TodoState, id: number) {
        return () => this.$.removeTodo(id);
      },

      // Tactical form handler using event target name
      onChange: function (value: TodoState, event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value: fieldValue } = event.target;
        this.set(name, fieldValue);
      },

      // Add new todo
      addTodo: function (value: TodoState) {
        if (!value.newTodoText.trim()) {
          return;
        }

        const newTodo: TodoItem = {
          id: Date.now(),
          text: value.newTodoText.trim(),
          completed: false,
        };

        this.mutate((draft) => {
          draft.todos.push(newTodo);
          draft.newTodoText = '';
        });
      },

      // Toggle todo completion
      toggleTodo: function (value: TodoState, id: number) {
        const updatedTodos = value.todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.set('todos', updatedTodos);
      },

      // Remove todo
      removeTodo: function (value: TodoState, id: number) {
        const filteredTodos = value.todos.filter((todo) => todo.id !== id);
        this.set('todos', filteredTodos);
      },

      // Set filter
      setFilter: function (value: TodoState, filter: 'all' | 'active' | 'completed') {
        this.set('filter', filter);
      },

      // Clear completed todos
      clearCompleted: function (value: TodoState) {
        const activeTodos = value.todos.filter((todo) => !todo.completed);
        this.set('todos', activeTodos);
      },
    },
    tests: [(value: TodoState) => (value.newTodoText.length > 100 ? 'Todo text too long' : null)],
  });
};
