import React from 'react';
import { Box, Input, Text } from '@chakra-ui/react';
import type { StoreIF } from '@wonderlandlabs/forestry4';
import useForestBranch from '../../hooks/useForestBranch';

interface FieldValue<T> {
  value: T;
  isDirty: boolean;
  error: string | null;
  title: string;
  type: string;
}

interface FieldProps<T> {
  parentStore: StoreIF<any>;
  path: string;
  branchFactory: (...args: any[]) => any;
  type?: 'text' | 'email' | 'number';
  placeholder?: string;
}

function Field<T>({ parentStore, path, branchFactory, type, placeholder }: FieldProps<T>) {
  // Create the branch internally
  const [fieldValue, fieldStore] = useForestBranch<FieldValue<T>>(parentStore, path, branchFactory);

  const hasError = fieldValue.error !== null;
  const borderColor = hasError ? 'red.300' : 'gray.200';

  // Check if the root form is submitting to disable input
  const isSubmitting = !!fieldStore.$root?.value?.isSubmitting;

  return (
    <Box>
      <Text mb={2} fontWeight="semibold">
        {fieldValue.title}
      </Text>
      <Input
        type={type}
        value={fieldValue.value as string}
        onChange={fieldStore.$.setFromEvent}
        borderColor={borderColor}
        placeholder={placeholder}
        disabled={isSubmitting}
        opacity={isSubmitting ? 0.6 : 1}
        cursor={isSubmitting ? 'not-allowed' : 'text'}
      />
      {hasError && (
        <Text textStyle="description" color="red.500" mt={1}>
          {fieldValue.error}
        </Text>
      )}
      {isSubmitting && (
        <Text textStyle="description" color="blue.500" mt={1}>
          Form is submitting...
        </Text>
      )}
    </Box>
  );
}

export default Field;
