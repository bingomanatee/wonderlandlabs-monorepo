// Angular Component using Forestry Service
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TodoService } from './todo.service';
import { Observable, Subscription } from 'rxjs';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

@Component({
  selector: 'app-todo-list',
  template: `
    <div class="todo-app">
      <h1>Todo List with Forestry</h1>
      
      <!-- Add Todo Form -->
      <div class="add-todo">
        <input
          type="text"
          placeholder="What needs to be done?"
          [value]="(todoService.newTodoText$ | async) || ''"
          (input)="updateNewTodoText($event)"
          (keyup.enter)="addTodo()"
          class="new-todo-input"
        />
        <button 
          (click)="addTodo()"
          [disabled]="!todoService.isNewTodoValid"
          class="add-button"
        >
          Add Todo
        </button>
      </div>

      <!-- Filter Buttons -->
      <div class="filters">
        <button 
          (click)="setFilter('all')"
          [class.active]="(todoService.filter$ | async) === 'all'"
        >
          All ({{ (todoService.todos$ | async)?.length || 0 }})
        </button>
        <button 
          (click)="setFilter('active')"
          [class.active]="(todoService.filter$ | async) === 'active'"
        >
          Active ({{ todoService.activeCount$ | async }})
        </button>
        <button 
          (click)="setFilter('completed')"
          [class.active]="(todoService.filter$ | async) === 'completed'"
        >
          Completed ({{ todoService.completedCount$ | async }})
        </button>
      </div>

      <!-- Todo List -->
      <ul class="todo-list">
        <li 
          *ngFor="let todo of todoService.filteredTodos$ | async; trackBy: trackByTodoId"
          class="todo-item"
          [class.completed]="todo.completed"
        >
          <input
            type="checkbox"
            [checked]="todo.completed"
            (change)="toggleTodo(todo.id)"
            class="todo-checkbox"
          />
          <span class="todo-text">{{ todo.text }}</span>
          <button 
            (click)="removeTodo(todo.id)"
            class="remove-button"
            aria-label="Remove todo"
          >
            ×
          </button>
        </li>
      </ul>

      <!-- Clear Completed -->
      <div class="actions" *ngIf="todoService.hasCompletedTodos">
        <button 
          (click)="clearCompleted()"
          class="clear-completed"
        >
          Clear Completed ({{ todoService.completedCount$ | async }})
        </button>
      </div>

      <!-- Validation Errors -->
      <div class="errors" *ngIf="validationErrors.length > 0">
        <h3>Validation Errors:</h3>
        <ul>
          <li *ngFor="let error of validationErrors" class="error">
            {{ error.message }}
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .todo-app {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .add-todo {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .new-todo-input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .add-button {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .add-button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .filters button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background-color: white;
      cursor: pointer;
      border-radius: 4px;
    }

    .filters button.active {
      background-color: #007bff;
      color: white;
    }

    .todo-list {
      list-style: none;
      padding: 0;
    }

    .todo-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }

    .todo-item.completed .todo-text {
      text-decoration: line-through;
      color: #6c757d;
    }

    .todo-text {
      flex: 1;
    }

    .remove-button {
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
    }

    .clear-completed {
      background-color: #ffc107;
      color: black;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }

    .errors {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
    }

    .error {
      color: #721c24;
    }
  `]
})
export class TodoListComponent implements OnInit, OnDestroy {
  validationErrors: any[] = [];
  private errorSubscription?: Subscription;

  constructor(public todoService: TodoService) {}

  ngOnInit(): void {
    // Subscribe to validation errors
    this.errorSubscription = this.todoService.$quality.subscribe(
      errors => {
        this.validationErrors = errors;
      }
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }

  // Event handlers
  updateNewTodoText(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.todoService.updateNewTodoText(target.value);
  }

  addTodo(): void {
    this.todoService.addTodo();
  }

  toggleTodo(id: number): void {
    this.todoService.toggleTodo(id);
  }

  removeTodo(id: number): void {
    this.todoService.removeTodo(id);
  }

  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.todoService.setFilter(filter);
  }

  clearCompleted(): void {
    this.todoService.clearCompleted();
  }

  // TrackBy function for performance
  trackByTodoId(index: number, todo: Todo): number {
    return todo.id;
  }
}
