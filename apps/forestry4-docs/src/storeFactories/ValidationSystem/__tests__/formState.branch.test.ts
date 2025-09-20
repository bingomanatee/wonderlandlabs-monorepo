import { describe, it, expect, beforeEach } from 'vitest';
import formStateFactory, { FormStateForest, FormState } from '../formState';
import { usernameBranchConfig, UsernameBranch } from '../usernameBranch';
import { emailBranchConfig, EmailBranch } from '../emailBranch';
import { ageBranchConfig, AgeBranch } from '../ageBranch';

describe('FormState Branch Synchronization', () => {
  let formForest: FormStateForest;

  beforeEach(() => {
    formForest = formStateFactory();
  });

  describe('Initial State', () => {
    it('should have correct initial form state', () => {
      expect(formForest.value.username.value).toBe('');
      expect(formForest.value.email.value).toBe('');
      expect(formForest.value.age.value).toBe(0);
      expect(formForest.value.isSubmitting).toBe(false);
      expect(formForest.value.canSubmit).toBe(false);
    });

    it('should have correct initial field states', () => {
      expect(formForest.value.username.isDirty).toBe(false);
      expect(formForest.value.username.error).toBe(null);
      expect(formForest.value.email.isDirty).toBe(false);
      expect(formForest.value.email.error).toBe(null);
      expect(formForest.value.age.isDirty).toBe(false);
      expect(formForest.value.age.error).toBe(null);
    });
  });

  describe('Branch Creation', () => {
    it('should create username branch correctly', () => {
      const usernameBranch = formForest.$branch<any, UsernameBranch>(['username'], usernameBranchConfig());
      
      expect(usernameBranch).toBeInstanceOf(UsernameBranch);
      expect(usernameBranch.$parent).toBe(formForest);
      expect(usernameBranch.$path).toEqual(['username']);
      expect(usernameBranch.value.value).toBe('');
    });

    it('should create email branch correctly', () => {
      const emailBranch = formForest.$branch<any, EmailBranch>(['email'], emailBranchConfig());
      
      expect(emailBranch).toBeInstanceOf(EmailBranch);
      expect(emailBranch.$parent).toBe(formForest);
      expect(emailBranch.$path).toEqual(['email']);
      expect(emailBranch.value.value).toBe('');
    });

    it('should create age branch correctly', () => {
      const ageBranch = formForest.$branch<any, AgeBranch>(['age'], ageBranchConfig());
      
      expect(ageBranch).toBeInstanceOf(AgeBranch);
      expect(ageBranch.$parent).toBe(formForest);
      expect(ageBranch.$path).toEqual(['age']);
      expect(ageBranch.value.value).toBe(0);
    });
  });

  describe('Branch to Root Synchronization', () => {
    it('should sync username branch updates to root', () => {
      const usernameBranch = formForest.$branch<any, UsernameBranch>(['username'], usernameBranchConfig());
      
      // Initial state check
      expect(formForest.value.username.value).toBe('');
      expect(usernameBranch.value.value).toBe('');
      
      // Update through branch
      usernameBranch.setValue('testuser');
      
      // Check both branch and root are updated
      expect(usernameBranch.value.value).toBe('testuser');
      expect(usernameBranch.value.isDirty).toBe(true);
      expect(formForest.value.username.value).toBe('testuser');
      expect(formForest.value.username.isDirty).toBe(true);
    });

    it('should sync email branch updates to root', () => {
      const emailBranch = formForest.$branch<any, EmailBranch>(['email'], emailBranchConfig());
      
      // Initial state check
      expect(formForest.value.email.value).toBe('');
      expect(emailBranch.value.value).toBe('');
      
      // Update through branch
      emailBranch.setValue('test@example.com');
      
      // Check both branch and root are updated
      expect(emailBranch.value.value).toBe('test@example.com');
      expect(emailBranch.value.isDirty).toBe(true);
      expect(formForest.value.email.value).toBe('test@example.com');
      expect(formForest.value.email.isDirty).toBe(true);
    });

    it('should sync age branch updates to root', () => {
      const ageBranch = formForest.$branch<any, AgeBranch>(['age'], ageBranchConfig());
      
      // Initial state check
      expect(formForest.value.age.value).toBe(0);
      expect(ageBranch.value.value).toBe(0);
      
      // Update through branch
      ageBranch.setValue(25);
      
      // Check both branch and root are updated
      expect(ageBranch.value.value).toBe(25);
      expect(ageBranch.value.isDirty).toBe(true);
      expect(formForest.value.age.value).toBe(25);
      expect(formForest.value.age.isDirty).toBe(true);
    });
  });

  describe('Validation Synchronization', () => {
    it('should sync username validation errors to root', () => {
      const usernameBranch = formForest.$branch<any, UsernameBranch>(['username'], usernameBranchConfig());
      
      // Set invalid username (too short)
      usernameBranch.setValue('ab');
      
      // Check validation error appears in both branch and root
      expect(usernameBranch.value.error).toBe('Username too short (min 3 characters)');
      expect(formForest.value.username.error).toBe('Username too short (min 3 characters)');
    });

    it('should sync email validation errors to root', () => {
      const emailBranch = formForest.$branch<any, EmailBranch>(['email'], emailBranchConfig());
      
      // Set invalid email
      emailBranch.setValue('invalid-email');
      
      // Check validation error appears in both branch and root
      expect(emailBranch.value.error).toBe('Invalid email format');
      expect(formForest.value.email.error).toBe('Invalid email format');
    });

    it('should sync age validation errors to root', () => {
      const ageBranch = formForest.$branch<any, AgeBranch>(['age'], ageBranchConfig());
      
      // Set invalid age (too young)
      ageBranch.setValue(10);
      
      // Check validation error appears in both branch and root
      expect(ageBranch.value.error).toBe('Users under 13 cannot create accounts due to COPPA regulations');
      expect(formForest.value.age.error).toBe('Users under 13 cannot create accounts due to COPPA regulations');
    });
  });

  describe('Multiple Branch Updates', () => {
    it('should handle multiple branch updates simultaneously', () => {
      const usernameBranch = formForest.$branch<any, UsernameBranch>(['username'], usernameBranchConfig());
      const emailBranch = formForest.$branch<any, EmailBranch>(['email'], emailBranchConfig());
      const ageBranch = formForest.$branch<any, AgeBranch>(['age'], ageBranchConfig());
      
      // Update all branches
      usernameBranch.setValue('testuser');
      emailBranch.setValue('test@example.com');
      ageBranch.setValue(25);
      
      // Check all updates are reflected in root
      expect(formForest.value.username.value).toBe('testuser');
      expect(formForest.value.email.value).toBe('test@example.com');
      expect(formForest.value.age.value).toBe(25);
      
      // Check all fields are marked as dirty
      expect(formForest.value.username.isDirty).toBe(true);
      expect(formForest.value.email.isDirty).toBe(true);
      expect(formForest.value.age.isDirty).toBe(true);
    });
  });

  describe('Form-level State Updates', () => {
    it('should update canSubmit based on branch validation', () => {
      const usernameBranch = formForest.$branch<any, UsernameBranch>(['username'], usernameBranchConfig());
      const emailBranch = formForest.$branch<any, EmailBranch>(['email'], emailBranchConfig());
      const ageBranch = formForest.$branch<any, AgeBranch>(['age'], ageBranchConfig());
      
      // Initially cannot submit
      expect(formForest.value.canSubmit).toBe(false);
      
      // Fill out valid form
      usernameBranch.setValue('validuser');
      emailBranch.setValue('valid@example.com');
      ageBranch.setValue(25);
      
      // Should now be able to submit
      expect(formForest.value.canSubmit).toBe(true);
      expect(formForest.value.submitError).toBe('');
    });

    it('should prevent submission with validation errors', () => {
      const usernameBranch = formForest.$branch<any, UsernameBranch>(['username'], usernameBranchConfig());
      const emailBranch = formForest.$branch<any, EmailBranch>(['email'], emailBranchConfig());
      const ageBranch = formForest.$branch<any, AgeBranch>(['age'], ageBranchConfig());
      
      // Fill out form with some invalid data
      usernameBranch.setValue('ab'); // Too short
      emailBranch.setValue('valid@example.com');
      ageBranch.setValue(25);
      
      // Should not be able to submit
      expect(formForest.value.canSubmit).toBe(false);
      expect(formForest.value.submitError).toBe('Please fix validation errors before submitting');
    });
  });

  describe('Event-based Updates', () => {
    it('should handle setFromEvent updates', () => {
      const usernameBranch = formForest.$branch<any, UsernameBranch>(['username'], usernameBranchConfig());
      
      // Mock event
      const mockEvent = {
        target: { value: 'eventuser' }
      } as React.ChangeEvent<HTMLInputElement>;
      
      usernameBranch.setFromEvent(mockEvent);
      
      // Check both branch and root are updated
      expect(usernameBranch.value.value).toBe('eventuser');
      expect(formForest.value.username.value).toBe('eventuser');
    });
  });

  describe('Subscription and Reactivity', () => {
    it('should notify subscribers when branch updates', () => {
      const usernameBranch = formForest.$branch<any, UsernameBranch>(['username'], usernameBranchConfig());
      
      let rootNotifications = 0;
      let branchNotifications = 0;
      
      // Subscribe to both root and branch
      const rootSub = formForest.subscribe(() => rootNotifications++);
      const branchSub = usernameBranch.subscribe(() => branchNotifications++);
      
      // Update branch
      usernameBranch.setValue('testuser');
      
      // Both should be notified
      expect(rootNotifications).toBeGreaterThan(0);
      expect(branchNotifications).toBeGreaterThan(0);
      
      // Cleanup
      rootSub.unsubscribe();
      branchSub.unsubscribe();
    });
  });
});
