// Vanilla JavaScript DOM Integration with Forestry
// Uses Forestry's $ methods directly - they're automatically bound to store instance
// All DOM handling, event listeners, and helper methods centralized in store
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

// Todo list state
/**
 * @typedef {Object} TodoItem
 * @property {number} id - Unique identifier
 * @property {string} text - Todo text
 * @property {boolean} completed - Completion status
 * @property {number} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} TodoState
 * @property {TodoItem[]} todos - List of todos
 * @property {string} filter - Current filter ('all', 'active', 'completed')
 * @property {string} newTodoText - Text for new todo
 */

// Validation schema
const TodoSchema = z.object({
  id: z.number(),
  text: z.string().min(1, 'Todo text cannot be empty'),
  completed: z.boolean(),
  createdAt: z.number(),
});

const TodoStateSchema = z.object({
  todos: z.array(TodoSchema),
  filter: z.enum(['all', 'active', 'completed']),
  newTodoText: z.string(),
});

// Todo store
class TodoStore extends Forest {
  constructor() {
    super({
      name: 'todo-store',
      value: {
        todos: [
          { id: 1, text: 'Learn Forestry', completed: true, createdAt: Date.now() - 86400000 },
          { id: 2, text: 'Build awesome apps', completed: false, createdAt: Date.now() - 3600000 },
          { id: 3, text: 'Share with the world', completed: false, createdAt: Date.now() },
        ],
        filter: 'all',
        newTodoText: '',
      },
      schema: TodoStateSchema,
    });
  }

  // Actions
  addTodo(text) {
    if (!text.trim()) return;

    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    this.mutate(draft => {
      draft.todos.push(newTodo);
      draft.newTodoText = '';
    });
  }

  toggleTodo(id) {
    this.mutate(draft => {
      const todo = draft.todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    });
  }

  deleteTodo(id) {
    this.mutate(draft => {
      draft.todos = draft.todos.filter(t => t.id !== id);
    });
  }

  editTodo(id, newText) {
    if (!newText.trim()) {
      this.deleteTodo(id);
      return;
    }

    this.mutate(draft => {
      const todo = draft.todos.find(t => t.id === id);
      if (todo) {
        todo.text = newText.trim();
      }
    });
  }

  setFilter(filter) {
    this.set('filter', filter);
  }

  setNewTodoText(text) {
    this.set('newTodoText', text);
  }

  clearCompleted() {
    this.mutate(draft => {
      draft.todos = draft.todos.filter(t => !t.completed);
    });
  }

  toggleAll() {
    const allCompleted = this.filteredTodos.every(t => t.completed);
    
    this.mutate(draft => {
      draft.todos.forEach(todo => {
        todo.completed = !allCompleted;
      });
    });
  }

  // Getters
  get filteredTodos() {
    const { todos, filter } = this.value;
    
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }

  get activeCount() {
    return this.value.todos.filter(t => !t.completed).length;
  }

  get completedCount() {
    return this.value.todos.filter(t => t.completed).length;
  }

  get totalCount() {
    return this.value.todos.length;
  }

  get hasCompleted() {
    return this.completedCount > 0;
  }

  get allCompleted() {
    return this.totalCount > 0 && this.activeCount === 0;
  }

  // Event handler methods
  onNewTodoKeypress(event) {
    if (event.key === 'Enter') {
      this.$.addTodo(event.target.value);
    }
  }

  onNewTodoInput(event) {
    this.$.setNewTodoText(event.target.value);
  }

  onFilterClick(event) {
    event.preventDefault();
    const filter = this.getFilterFromHash(event.target.getAttribute('href'));
    this.$.setFilter(filter);
  }

  onTodoListClick(event) {
    const todoItem = event.target.closest('.todo-item');
    if (!todoItem) return;

    const id = parseInt(todoItem.dataset.id);
    if (event.target.classList.contains('toggle')) {
      this.$.toggleTodo(id);
    } else if (event.target.classList.contains('destroy')) {
      this.$.deleteTodo(id);
    }
  }

  // DOM element getters - dynamic query selectors (no stale references)
  get container() { return document.getElementById(this.containerId); }
  get newTodo() { return this.container?.querySelector('.new-todo'); }
  get toggleAll() { return this.container?.querySelector('.toggle-all'); }
  get todoList() { return this.container?.querySelector('.todo-list'); }
  get clearCompleted() { return this.container?.querySelector('.clear-completed'); }
  get filters() { return this.container?.querySelectorAll('.filters a'); }
  get main() { return this.container?.querySelector('.main'); }
  get footer() { return this.container?.querySelector('.footer'); }
  get todoCount() { return this.container?.querySelector('.todo-count'); }

  // DOM initialization
  initializeDOM(containerId) {
    this.containerId = containerId; // Store container ID for getters

    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    this.bindEvents();
    this.subscribeToSelf();
  }

  // Event binding - using dynamic getters
  bindEvents() {
    // New todo input - using $ methods (automatically bound)
    this.newTodo?.addEventListener('keypress', this.$.onNewTodoKeypress);
    this.newTodo?.addEventListener('input', this.$.onNewTodoInput);

    // Toggle all - direct $ method binding
    this.toggleAll?.addEventListener('change', this.$.toggleAll);

    // Clear completed - direct $ method binding
    this.clearCompleted?.addEventListener('click', this.$.clearCompleted);

    // Filter links - using $ method (automatically bound)
    this.filters?.forEach(link => {
      link.addEventListener('click', this.$.onFilterClick);
    });

    // Todo list delegation - using $ method (automatically bound)
    this.todoList?.addEventListener('click', this.$.onTodoListClick);
  }

  // UI updates - centralized in store
  subscribeToSelf() {
    this.$subject.subscribe(state => {
      this.updateUI(state);
    });
  }

  updateUI(state) {
    // Update todo list
    this.renderTodos(state.filteredTodos);

    // Update counters and controls
    this.updateControls(state);
  }

  renderTodos(todos) {
    if (this.todoList) {
      this.todoList.innerHTML = todos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
          <div class="view">
            <input class="toggle" type="checkbox" ${todo.completed ? 'checked' : ''}>
            <label>${todo.text}</label>
            <button class="destroy"></button>
          </div>
        </li>
      `).join('');
    }
  }

  updateControls(state) {
    if (this.toggleAll) this.toggleAll.checked = state.allCompleted;
    if (this.clearCompleted) {
      this.clearCompleted.style.display = state.completedCount > 0 ? 'block' : 'none';
    }

    // Update todo count
    if (this.todoCount) {
      const count = state.activeCount;
      this.todoCount.textContent = `${count} item${count !== 1 ? 's' : ''} left`;
    }

    // Show/hide main and footer sections
    if (this.main) this.main.style.display = state.totalCount > 0 ? 'block' : 'none';
    if (this.footer) this.footer.style.display = state.totalCount > 0 ? 'block' : 'none';
  }

  // Helper methods moved from DOM layer to store
  getFilterFromHash(hash) {
    switch (hash) {
      case '#/active': return 'active';
      case '#/completed': return 'completed';
      default: return 'all';
    }
  }
}

// DOM Manager for Todo App - simplified since store handles everything
class TodoDOM {
  constructor(store, containerId) {
    this.store = store;
    this.init(containerId);
  }

  init(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="todo-app">
        <header class="header">
          <h1>todos</h1>
          <input
            class="new-todo"
            placeholder="What needs to be done?"
            autofocus
          />
        </header>

        <section class="main" style="display: none;">
          <input id="toggle-all" class="toggle-all" type="checkbox">
          <label for="toggle-all">Mark all as complete</label>
          <ul class="todo-list"></ul>
        </section>

        <footer class="footer" style="display: none;">
          <span class="todo-count"></span>
          <ul class="filters">
            <li><a href="#/" class="selected">All</a></li>
            <li><a href="#/active">Active</a></li>
            <li><a href="#/completed">Completed</a></li>
          </ul>
          <button class="clear-completed" style="display: none;">
            Clear completed
          </button>
        </footer>
      </div>
    `;

    // Initialize store's DOM handling
    this.store.initializeDOM(containerId);
  }

  bindEvents() {
    // New todo input - use $ methods directly
    this.elements.newTodo.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.store.$.addTodo(e.target.value);
      }
    });

    this.elements.newTodo.addEventListener('input', (e) => {
      this.store.$.setNewTodoText(e.target.value);
    });

    // Toggle all - direct $ method binding
    this.elements.toggleAll.addEventListener('change', this.store.$.toggleAll);

    // Clear completed - direct $ method binding
    this.elements.clearCompleted.addEventListener('click', this.store.$.clearCompleted);

    // Filter links
    this.elements.filters.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = this.store.getFilterFromHash(link.getAttribute('href'));
        this.store.$.setFilter(filter);
        this.updateFilterSelection();
      });
    });

    // Todo list events (using event delegation)
    this.elements.todoList.addEventListener('click', (e) => {
      const todoItem = e.target.closest('.todo-item');
      if (!todoItem) return;

      const id = parseInt(todoItem.dataset.id);

      if (e.target.classList.contains('toggle')) {
        this.store.$.toggleTodo(id);
      } else if (e.target.classList.contains('destroy')) {
        this.store.$.deleteTodo(id);
      }
    });

    this.elements.todoList.addEventListener('dblclick', (e) => {
      const todoItem = e.target.closest('.todo-item');
      if (todoItem && e.target.classList.contains('todo-text')) {
        this.startEditing(parseInt(todoItem.dataset.id));
      }
    });

    // Handle edit input events
    this.elements.todoList.addEventListener('keypress', (e) => {
      if (e.target.classList.contains('edit') && e.key === 'Enter') {
        this.finishEditing(e.target);
      }
    });

    this.elements.todoList.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('edit') && e.key === 'Escape') {
        this.cancelEditing();
      }
    });

    this.elements.todoList.addEventListener('blur', (e) => {
      if (e.target.classList.contains('edit')) {
        this.finishEditing(e.target);
      }
    }, true);
  }

  subscribeToStore() {
    this.subscription = this.store.$subject.subscribe(state => {
      this.render(state);
    });

    this.errorSubscription = this.store.$quality.subscribe(errors => {
      this.handleErrors(errors);
    });

    // Initial render
    this.render(this.store.value);
  }

  render(state) {
    this.renderTodos();
    this.renderFooter();
    this.updateVisibility();
    this.updateNewTodoInput(state.newTodoText);
    this.updateToggleAll();
  }

  renderTodos() {
    const todos = this.store.filteredTodos;
    
    this.elements.todoList.innerHTML = todos.map(todo => `
      <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <div class="view">
          <input class="toggle" type="checkbox" ${todo.completed ? 'checked' : ''}>
          <span class="todo-text">${this.escapeHtml(todo.text)}</span>
          <button class="destroy"></button>
        </div>
        <input class="edit" value="${this.escapeHtml(todo.text)}">
      </li>
    `).join('');
  }

  renderFooter() {
    const activeCount = this.store.activeCount;
    const completedCount = this.store.completedCount;
    
    this.elements.todoCount.innerHTML = `
      <strong>${activeCount}</strong> 
      ${activeCount === 1 ? 'item' : 'items'} left
    `;

    this.elements.clearCompleted.style.display = completedCount > 0 ? 'block' : 'none';
    this.elements.clearCompleted.textContent = `Clear completed (${completedCount})`;
  }

  updateVisibility() {
    const hasItems = this.store.totalCount > 0;
    this.elements.main.style.display = hasItems ? 'block' : 'none';
    this.elements.footer.style.display = hasItems ? 'block' : 'none';
  }

  updateNewTodoInput(value) {
    if (document.activeElement !== this.elements.newTodo) {
      this.elements.newTodo.value = value;
    }
  }

  updateToggleAll() {
    this.elements.toggleAll.checked = this.store.allCompleted;
  }

  updateFilterSelection() {
    this.elements.filters.forEach(link => {
      const filter = this.getFilterFromHash(link.getAttribute('href'));
      link.classList.toggle('selected', filter === this.store.value.filter);
    });
  }

  startEditing(id) {
    this.editingId = id;
    const todoItem = this.container.querySelector(`[data-id="${id}"]`);
    todoItem.classList.add('editing');
    
    const editInput = todoItem.querySelector('.edit');
    editInput.focus();
    editInput.select();
  }

  finishEditing(input) {
    if (this.editingId === null) return;

    const newText = input.value.trim();
    this.store.$.editTodo(this.editingId, newText);
    this.cancelEditing();
  }

  cancelEditing() {
    if (this.editingId === null) return;

    const todoItem = this.container.querySelector(`[data-id="${this.editingId}"]`);
    if (todoItem) {
      todoItem.classList.remove('editing');
    }
    
    this.editingId = null;
  }

  // Helper methods moved to store

  handleErrors(errors) {
    if (errors.length > 0) {
      console.error('Todo validation errors:', errors);
      
      // Simple error display
      errors.forEach(error => {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = error.message;
        errorEl.style.cssText = `
          background: #f8d7da;
          color: #721c24;
          padding: 8px;
          margin: 4px 0;
          border-radius: 4px;
          border: 1px solid #f5c6cb;
        `;
        
        this.container.insertBefore(errorEl, this.container.firstChild);
        
        setTimeout(() => errorEl.remove(), 3000);
      });
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Create container if it doesn't exist
  if (!document.getElementById('todo-app')) {
    const container = document.createElement('div');
    container.id = 'todo-app';
    document.body.appendChild(container);
  }

  // Create store and DOM manager
  const todoStore = new TodoStore();
  const todoDOM = new TodoDOM(todoStore, 'todo-app');

  // Add TodoMVC CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/todomvc-app-css@2.4.2/index.css';
  document.head.appendChild(link);

  // Handle browser back/forward
  window.addEventListener('hashchange', () => {
    const filter = todoDOM.getFilterFromHash(window.location.hash);
    todoStore.setFilter(filter);
    todoDOM.updateFilterSelection();
  });

  // Set initial filter from URL
  const initialFilter = todoDOM.getFilterFromHash(window.location.hash);
  todoStore.setFilter(initialFilter);
  todoDOM.updateFilterSelection();

  // Global access for debugging
  window.todoStore = todoStore;
  window.todoDOM = todoDOM;
  
  console.log('Todo app initialized with Forestry!');
  console.log('Try: todoStore.addTodo("New task"), todoStore.toggleTodo(1), etc.');
});

export { TodoStore, TodoDOM };
