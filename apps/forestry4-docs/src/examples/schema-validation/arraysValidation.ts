// Array Validation Patterns with Zod
import { z } from 'zod';
import { Forest } from '@wonderlandlabs/forestry';

// Simple array validations
const TagSchema = z.string().min(1).max(20);
const TagsArraySchema = z.array(TagSchema).min(1, 'At least one tag required').max(10, 'Maximum 10 tags allowed');

// Object array validation
const TodoItemSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1, 'Todo text is required'),
  completed: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.date().optional(),
  tags: z.array(z.string()).default([])
});

// Complex array with validation rules
const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  
  // Array of strings with validation
  tags: TagsArraySchema,
  
  // Array of objects with validation
  todos: z.array(TodoItemSchema).default([]),
  
  // Array with custom validation
  collaborators: z.array(z.string().email()).min(1, 'At least one collaborator required'),
  
  // Array with refinement (custom validation logic)
  milestones: z.array(z.object({
    name: z.string().min(1),
    dueDate: z.date(),
    completed: z.boolean().default(false)
  })).refine(
    (milestones) => {
      // Ensure milestone dates are in chronological order
      for (let i = 1; i < milestones.length; i++) {
        if (milestones[i].dueDate <= milestones[i - 1].dueDate) {
          return false;
        }
      }
      return true;
    },
    { message: 'Milestone dates must be in chronological order' }
  ),
  
  // Nested arrays
  categories: z.array(z.object({
    name: z.string().min(1),
    subcategories: z.array(z.string()).default([])
  })).default([])
});

class ProjectForest extends Forest {
  constructor() {
    super({
      id: '',
      name: '',
      description: undefined,
      tags: [],
      todos: [],
      collaborators: [],
      milestones: [],
      categories: []
    }, {
      name: 'ProjectStore',
      schema: ProjectSchema
    });
  }

  addTodo(text: string, priority: 'low' | 'medium' | 'high' = 'medium', dueDate?: Date) {
    const newTodo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      priority,
      dueDate,
      tags: []
    };

    this.next({
      ...this.value,
      todos: [...this.value.todos, newTodo]
    });
  }

  toggleTodo(todoId: string) {
    this.next({
      ...this.value,
      todos: this.value.todos.map(todo =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    });
  }

  addTag(tag: string) {
    if (this.value.tags.includes(tag)) {
      throw new Error('Tag already exists');
    }

    this.next({
      ...this.value,
      tags: [...this.value.tags, tag]
    });
  }

  removeTag(tag: string) {
    this.next({
      ...this.value,
      tags: this.value.tags.filter(t => t !== tag)
    });
  }

  addCollaborator(email: string) {
    if (this.value.collaborators.includes(email)) {
      throw new Error('Collaborator already exists');
    }

    this.next({
      ...this.value,
      collaborators: [...this.value.collaborators, email]
    });
  }

  addMilestone(name: string, dueDate: Date) {
    const newMilestone = {
      name,
      dueDate,
      completed: false
    };

    // Insert in chronological order
    const milestones = [...this.value.milestones, newMilestone]
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    this.next({
      ...this.value,
      milestones
    });
  }
}

// Usage
const projectStore = new ProjectForest();

// Initialize project
projectStore.next({
  ...projectStore.value,
  id: crypto.randomUUID(),
  name: 'My Project',
  tags: ['web', 'typescript'],
  collaborators: ['user1@example.com', 'user2@example.com']
});

// Add todos
projectStore.addTodo('Setup project structure', 'high', new Date('2024-01-15'));
projectStore.addTodo('Write documentation', 'medium');

// Add milestones in order
projectStore.addMilestone('Alpha Release', new Date('2024-02-01'));
projectStore.addMilestone('Beta Release', new Date('2024-03-01'));
projectStore.addMilestone('Final Release', new Date('2024-04-01'));
