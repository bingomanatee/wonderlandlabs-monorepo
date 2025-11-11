// Vanilla JavaScript with Forestry
// Uses Forestry's $ methods directly - they're automatically bound to store instance
// Uses dynamic getters for DOM elements to avoid stale references
// All event handling and UI updates are centralized in the store
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

// Counter state interface (using JSDoc for type hints)
/**
 * @typedef {Object} CounterState
 * @property {number} count - Current count value
 * @property {number} step - Step size for increment/decrement
 * @property {string} message - Display message
 * @property {boolean} isEven - Whether count is even
 */

// Validation schema
const CounterStateSchema = z.object({
  count: z.number(),
  step: z.number().min(1, 'Step must be at least 1'),
  message: z.string(),
  isEven: z.boolean(),
});

// Counter store class
class CounterStore extends Forest {
  constructor() {
    super({
      name: 'counter-store',
      value: {
        count: 0,
        step: 1,
        message: 'Welcome to Forestry!',
        isEven: true,
      },
      schema: CounterStateSchema,
    });
  }

  // Actions
  increment() {
    this.mutate(draft => {
      draft.count += draft.step;
      draft.isEven = draft.count % 2 === 0;
      draft.message = `Count is now ${draft.count}`;
    });
  }

  decrement() {
    this.mutate(draft => {
      draft.count -= draft.step;
      draft.isEven = draft.count % 2 === 0;
      draft.message = `Count is now ${draft.count}`;
    });
  }

  setStep(step) {
    this.set('step', Math.max(1, step));
  }

  reset() {
    this.mutate(draft => {
      draft.count = 0;
      draft.isEven = true;
      draft.message = 'Counter reset!';
    });
  }

  setMessage(message) {
    this.set('message', message);
  }

  // DOM element getters - dynamic query selectors (no stale references)
  get incrementBtn() { return document.getElementById('increment-btn'); }
  get decrementBtn() { return document.getElementById('decrement-btn'); }
  get resetBtn() { return document.getElementById('reset-btn'); }
  get stepInput() { return document.getElementById('step-input'); }
  get messageInput() { return document.getElementById('message-input'); }
  get countDisplay() { return document.getElementById('counter-value'); }
  get messageDisplay() { return document.getElementById('counter-message'); }
  get statusDisplay() { return document.getElementById('counter-status'); }
  get signDisplay() { return document.getElementById('counter-sign'); }
  get absoluteDisplay() { return document.getElementById('absolute-value'); }
  get displayTextEl() { return document.getElementById('display-text'); }

  // DOM initialization
  initializeDOM() {
    this.bindEvents();
    this.subscribeToSelf();
  }

  // Event handler methods
  onStepChange(event) {
    const step = parseInt(event.target.value) || 1;
    this.$.setStep(step);
  }

  onMessageInput(event) {
    if (event.target.value.trim()) {
      this.$.setMessage(event.target.value);
    }
  }

  onKeyDown(event) {
    switch (event.key) {
      case 'ArrowUp':
      case '+':
        event.preventDefault();
        this.$.increment();
        break;
      case 'ArrowDown':
      case '-':
        event.preventDefault();
        this.$.decrement();
        break;
      case 'r':
      case 'R':
        event.preventDefault();
        this.$.reset();
        break;
    }
  }

  // Event binding - using dynamic getters
  bindEvents() {
    // Button events - direct $ method binding
    this.incrementBtn?.addEventListener('click', this.$.increment);
    this.decrementBtn?.addEventListener('click', this.$.decrement);
    this.resetBtn?.addEventListener('click', this.$.reset);

    // Input events - using $ methods (automatically bound)
    this.stepInput?.addEventListener('change', this.$.onStepChange);
    this.messageInput?.addEventListener('input', this.$.onMessageInput);

    // Keyboard shortcuts - using $ method (automatically bound)
    document.addEventListener('keydown', this.$.onKeyDown);
  }

  // UI updates - centralized in store
  subscribeToSelf() {
    this.$subject.subscribe(state => {
      this.updateUI(state);
    });
  }

  updateUI(state) {
    const { count, message, isEven } = state;

    // Update display elements using dynamic getters
    if (this.countDisplay) this.countDisplay.textContent = count;
    if (this.messageDisplay) this.messageDisplay.textContent = message;

    // Update status
    if (this.statusDisplay) {
      this.statusDisplay.textContent = isEven ? 'Even' : 'Odd';
      this.statusDisplay.className = `status ${isEven ? 'even' : 'odd'}`;
    }

    // Update sign indicator
    const sign = count > 0 ? 'positive' : count < 0 ? 'negative' : 'neutral';
    const signText = count > 0 ? 'Positive' : count < 0 ? 'Negative' : 'Zero';
    if (this.signDisplay) {
      this.signDisplay.textContent = signText;
      this.signDisplay.className = `sign ${sign}`;
    }

    // Update computed values
    if (this.absoluteDisplay) this.absoluteDisplay.textContent = this.absoluteValue;
    if (this.displayTextEl) this.displayTextEl.textContent = this.displayText;

    // Update step input if it doesn't have focus
    if (this.stepInput && document.activeElement !== this.stepInput) {
      this.stepInput.value = state.step;
    }
  }

  // Computed properties
  get isPositive() {
    return this.value.count > 0;
  }

  get isNegative() {
    return this.value.count < 0;
  }

  get absoluteValue() {
    return Math.abs(this.value.count);
  }

  get displayText() {
    const { count, isEven } = this.value;
    return `${count} (${isEven ? 'even' : 'odd'})`;
  }
}

// Create store instance
const counterStore = new CounterStore();

// Simple event emitter for UI updates
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

// UI Controller - minimal since store handles everything
class CounterUI {
  constructor(store) {
    this.store = store;
    this.init();
  }

  init() {
    // Create UI elements
    this.container = document.createElement('div');
    this.container.className = 'counter-app';
    this.container.innerHTML = `
      <div class="counter-display">
        <h2 id="counter-value">0</h2>
        <p id="counter-message">Welcome to Forestry!</p>
        <div class="counter-info">
          <span id="counter-status" class="status even">Even</span>
          <span id="counter-sign" class="sign neutral">Zero</span>
        </div>
      </div>
      
      <div class="counter-controls">
        <button id="decrement-btn" class="btn btn-danger">-</button>
        <button id="increment-btn" class="btn btn-success">+</button>
        <button id="reset-btn" class="btn btn-secondary">Reset</button>
      </div>
      
      <div class="counter-settings">
        <label for="step-input">Step:</label>
        <input type="number" id="step-input" min="1" value="1" />
        
        <label for="message-input">Message:</label>
        <input type="text" id="message-input" placeholder="Enter custom message" />
      </div>
      
      <div class="counter-stats">
        <div>Absolute Value: <span id="absolute-value">0</span></div>
        <div>Display Text: <span id="display-text">0 (even)</span></div>
      </div>
    `;

    // Append to document
    document.body.appendChild(this.container);

    // Initialize store's DOM references and event binding
    this.store.initializeDOM();
  }

  // All DOM handling now in store - just mount the UI
  mount(parentElement) {
    parentElement.appendChild(this.container);
    return this;
  }
}

// Usage example
document.addEventListener('DOMContentLoaded', () => {
  const app = new CounterUI(counterStore);
  app.mount(document.body);
  
  // Listen to state changes
  app.onStateChange((state) => {
    console.log('Counter state changed:', state);
    
    // Update document title
    document.title = `Counter: ${state.count}`;
  });
  
  // Add some CSS
  const style = document.createElement('style');
  style.textContent = `
    .counter-app {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-family: Arial, sans-serif;
    }
    
    .counter-display {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .counter-display h2 {
      font-size: 3em;
      margin: 0;
      color: #333;
    }
    
    .counter-info {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 10px 0;
    }
    
    .status.even { color: #28a745; }
    .status.odd { color: #dc3545; }
    .sign.positive { color: #007bff; }
    .sign.negative { color: #dc3545; }
    .sign.neutral { color: #6c757d; }
    
    .counter-controls {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin: 20px 0;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    
    .btn-success { background-color: #28a745; color: white; }
    .btn-danger { background-color: #dc3545; color: white; }
    .btn-secondary { background-color: #6c757d; color: white; }
    
    .counter-settings {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 10px;
      align-items: center;
      margin: 20px 0;
    }
    
    .counter-settings input {
      padding: 5px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .counter-stats {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .validation-errors {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
    }
  `;
  document.head.appendChild(style);
});

// Export for use in other modules
export { counterStore, CounterUI };
