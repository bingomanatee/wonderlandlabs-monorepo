import React from 'react';
import { FieldBranch, type FieldValue, StringFieldValueSchema } from './FieldBranch';
import { z } from 'zod';

// Username-specific validators
const usernameValidators = [
  (value: string) => value.length < 3 ? 'Username too short (min 3 characters)' : null,
  (value: string) => value.length > 20 ? 'Username too long (max 20 characters)' : null,
  (value: string) => value.includes(' ') ? 'Username cannot contain spaces' : null,
  (value: string) => {
    const reservedUsernames = ['admin', 'root', 'system', 'api', 'null', 'undefined'];
    return reservedUsernames.includes(value.toLowerCase()) ? 'Username is reserved and cannot be used' : null;
  },
  (value: string) => {
    const inappropriateWords = ['spam', 'test123', 'delete', 'hack'];
    return inappropriateWords.some(word => value.toLowerCase().includes(word)) ? 'Username contains inappropriate content' : null;
  }
];

/**
 * Username-specific FieldBranch subclass
 */
export class UsernameBranch extends FieldBranch<string> {
  constructor() {
    super('', usernameValidators, 'Username');
  }

  // Username-specific methods
  setFromEvent(event: React.ChangeEvent<HTMLInputElement>) {
    this.setValue(event.target.value);
  }

  clear() {
    this.setValue('');
  }

  // Computed properties
  get isValidLength(): boolean {
    const length = this.value.value.length;
    return length >= 3 && length <= 20;
  }

  get isAvailable(): boolean {
    // In a real app, this would check against a database
    const reservedUsernames = ['admin', 'root', 'system', 'api', 'null', 'undefined'];
    return !reservedUsernames.includes(this.value.value.toLowerCase());
  }
}

// Branch configuration for use with $branch
export function usernameBranchConfig() {
  return {
    subclass: UsernameBranch,
    schema: StringFieldValueSchema,
  };
}
