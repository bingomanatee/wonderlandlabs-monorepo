import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

type Validator<T> = (value: T) => string | null;

// Zod schema for FieldValue - generic schema factory
export const createFieldValueSchema = <T>(valueSchema: z.ZodType<T>) =>
  z.object({
    value: valueSchema,
    isDirty: z.boolean(),
    error: z.string().nullable(),
    title: z.string(),
    type: z.string(),
  });

// Type inference from the schema
export type FieldValue<T> = z.infer<ReturnType<typeof createFieldValueSchema<T>>>;

// Convenience schemas for common field types
export const StringFieldValueSchema = createFieldValueSchema(z.string());
export const NumberFieldValueSchema = createFieldValueSchema(z.number());
export const BooleanFieldValueSchema = createFieldValueSchema(z.boolean());

// Type exports for convenience
export type StringFieldValue = z.infer<typeof StringFieldValueSchema>;
export type NumberFieldValue = z.infer<typeof NumberFieldValueSchema>;
export type BooleanFieldValue = z.infer<typeof BooleanFieldValueSchema>;

export class FieldBranch<T> extends Forest<FieldValue<T>> {
  protected validators: Array<Validator<T>>;
  protected fieldType: string;

  constructor(params: any) {
    // Extract field-specific parameters
    const { validators = [], fieldType = 'Field', initialValue, ...forestParams } = params;

    // The $branch method automatically provides parent, path, and name
    // We just need to set up the field-specific value structure
    super({
      ...forestParams,
      // Don't override value if it's already provided by the parent branch
      value: forestParams.value || {
        value: initialValue || (typeof initialValue === 'number' ? 0 : ''),
        isDirty: false,
        error: null,
        title: fieldType,
        type: fieldType.toLowerCase(),
      },
      prep: (input: Partial<FieldValue<T>>, current: FieldValue<T>): FieldValue<T> => {
        const result = { ...current, ...input };

        // Set initial value if it doesn't exist, then check if dirty
        if (!this.$res.has('initialValue')) {
          this.$res.set('initialValue', result.value);
        }

        const initialValue = this.$res.get('initialValue');
        result.isDirty = current.isDirty || result.value !== initialValue;

        // ALL user validation feedback (only show errors when dirty)
        let error: string | null = null;

        if (result.isDirty) {
          // Run all validators
          for (const validator of validators) {
            const validationError = validator(result.value);
            if (validationError) {
              error = validationError;
              break; // Stop at first error
            }
          }
        }
        result.error = error;

        return result;
      },
      res: new Map([
        // Reactive validation state for external consumption
        [
          'validationStatus',
          (field: FieldValue<T>) => {
            return {
              hasError: field.error !== null,
              error: field.error,
              fieldType: fieldType,
            };
          },
        ],
      ]),
      tests: [
        // Tests should only catch truly impossible states that indicate system bugs
        // User input validation belongs in prep
      ],
    });
    this.validators = validators;
    this.fieldType = fieldType;
  }

  setValue(newValue: T) {
    this.mutate((value: FieldValue<T>) => {
      value.value = newValue;
      value.isDirty = true;
    });
  }

  // Event-centric action that extracts value from input events
  setValueFromEvent(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value as T;
    this.setValue(value);
  }
}
