import { Forest } from '@wonderlandlabs/forestry4';
import { AdvancedForm } from '@/types.ts';

export default function formStateFactory() {
  const forest = new Forest<AdvancedForm>({
    name: 'advanced-form',
    value: {
      username: { value: '', isValid: true, errorString: '' },
      email: { value: '', isValid: true, errorString: '' },
      age: { value: 0, isValid: true, errorString: '' },
      isSubmitting: false,
      canSubmit: false,
      submitError: 'Please fill out all fields',
    },
    actions: {
      setSubmitting: function (value: AdvancedForm, isSubmitting: boolean) {
        this.set('isSubmitting', isSubmitting);
      },
    },
    prep: function (input: Partial<AdvancedForm>, current: AdvancedForm): AdvancedForm {
      const result = { ...current, ...input };

      // Calculate canSubmit and submitError based on field validity
      const allFieldsValid = result.username.isValid && result.email.isValid && result.age.isValid;
      const allFieldsFilled =
        result.username.value.length > 0 && result.email.value.length > 0 && result.age.value > 0;

      if (!allFieldsFilled) {
        result.canSubmit = false;
        result.submitError = 'Please fill out all fields';
      } else if (!allFieldsValid) {
        result.canSubmit = false;
        result.submitError = 'Please fix validation errors before submitting';
      } else if (result.isSubmitting) {
        result.canSubmit = false;
        result.submitError = 'Submitting...';
      } else {
        result.canSubmit = true;
        result.submitError = '';
      }

      return result;
    },
    tests: [
      // Critical business rule - Username/email combination uniqueness
      (value: AdvancedForm) => {
        // In real app, this would check database for existing user
        const testConflict =
          value.username.value === 'admin' && value.email.value.includes('admin');
        return testConflict ? 'Username and email combination already exists' : null;
      },
    ],
  });

  return forest;
}
