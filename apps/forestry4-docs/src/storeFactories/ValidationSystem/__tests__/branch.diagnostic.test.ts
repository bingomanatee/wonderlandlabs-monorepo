import { describe, expect, it } from 'vitest';
import { Forest } from '@wonderlandlabs/forestry4';

// Simple test to understand branch behavior
describe('Branch Diagnostic', () => {
  it('should demonstrate basic branch synchronization', () => {
    // Create a simple parent forest
    const parent = new Forest({
      name: 'parent',
      value: {
        user: { name: 'John', age: 30 },
        settings: { theme: 'light' },
      },
    });

    console.log('Initial parent state:', parent.value);

    // Create a branch at the 'user' path
    const userBranch = parent.$branch(['user'], {});

    console.log('Branch parent:', userBranch.$parent === parent);
    console.log('Branch path:', userBranch.$path);
    console.log('Branch value:', userBranch.value);
    console.log('Parent user value:', parent.value.user);

    // Update through branch
    userBranch.mutate((draft) => {
      draft.name = 'Jane';
      draft.age = 25;
    });

    console.log('After branch update:');
    console.log('Branch value:', userBranch.value);
    console.log('Parent user value:', parent.value.user);

    // Test expectations
    expect(userBranch.$parent).toBe(parent);
    expect(userBranch.$path).toEqual(['user']);
    expect(userBranch.value.name).toBe('Jane');
    expect(parent.value.user.name).toBe('Jane'); // This should pass if branches work
  });

  it('should test with custom subclass', () => {
    class UserBranch extends Forest<{ name: string; age: number }> {
      updateName(name: string) {
        this.mutate((draft) => {
          draft.name = name;
        });
      }
    }

    const parent = new Forest({
      name: 'parent',
      value: {
        user: { name: 'John', age: 30 },
        settings: { theme: 'light' },
      },
    });

    const userBranch = parent.$branch<{ name: string; age: number }, UserBranch>(['user'], {
      subclass: UserBranch,
    });

    console.log('Custom branch parent:', userBranch.$parent === parent);
    console.log('Custom branch is UserBranch:', userBranch instanceof UserBranch);

    userBranch.updateName('CustomJane');

    console.log('After custom branch update:');
    console.log('Branch value:', userBranch.value);
    console.log('Parent user value:', parent.value.user);

    expect(userBranch instanceof UserBranch).toBe(true);
    expect(userBranch.value.name).toBe('CustomJane');
    expect(parent.value.user.name).toBe('CustomJane'); // This should pass if branches work
  });

  it('should test field-like branch with prep function', () => {
    interface FieldValue {
      value: string;
      isDirty: boolean;
      error: string | null;
    }

    class FieldBranch extends Forest<FieldValue> {
      constructor(params: any) {
        super({
          ...params,
          prep: (input: Partial<FieldValue>, current: FieldValue): FieldValue => {
            const result = { ...current, ...input };

            // Set initial value if it doesn't exist - use the ORIGINAL value, not the updated one
            if (!this.$res.has('initialValue')) {
              this.$res.set('initialValue', current.value);
            }

            const initialValue = this.$res.get('initialValue');
            // Don't override isDirty if it's already set to true
            if (!result.isDirty) {
              result.isDirty = result.value !== initialValue;
            }

            // Simple validation
            result.error = result.value.length < 3 ? 'Too short' : null;

            return result;
          },
        });
      }

      setValue(newValue: string) {
        this.mutate((draft: FieldValue) => {
          draft.value = newValue;
          draft.isDirty = true;
        });
      }
    }

    const parent = new Forest({
      name: 'parent',
      value: {
        username: { value: '', isDirty: false, error: null },
        email: { value: '', isDirty: false, error: null },
      },
    });

    console.log('Initial parent state:', parent.value);

    const usernameBranch = parent.$branch<FieldValue, FieldBranch>(['username'], {
      subclass: FieldBranch,
    });

    console.log('Field branch parent:', usernameBranch.$parent === parent);
    console.log('Field branch value:', usernameBranch.value);
    console.log('Parent username value:', parent.value.username);

    // Update through branch
    usernameBranch.setValue('test');

    console.log('After field branch update:');
    console.log('Branch value:', usernameBranch.value);
    console.log('Parent username value:', parent.value.username);

    expect(usernameBranch.value.value).toBe('test');
    expect(usernameBranch.value.isDirty).toBe(true);
    expect(parent.value.username.value).toBe('test'); // This might fail
    expect(parent.value.username.isDirty).toBe(true); // This might fail
  });
});
