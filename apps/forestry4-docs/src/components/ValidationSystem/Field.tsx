import React from 'react';
import { Box, Text, Input, NumberInput, NumberInputField } from '@chakra-ui/react';
import type { StoreIF } from '@wonderlandlabs/forestry4';
import useForestBranch from '@/hooks/useForestBranch';

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

  return (
    <Box>
      <Text mb={2} fontWeight="semibold">
        {fieldValue.title}
      </Text>
      <Input
        type={type}
        value={fieldValue.value as string}
        onChange={(e) => (fieldStore as any).setFromEvent(e)}
        borderColor={borderColor}
        placeholder={placeholder}
      />
      {hasError && (
        <Text fontSize="sm" color="red.500" mt={1}>
          {fieldValue.error}
        </Text>
      )}
    </Box>
  );
}

export default Field;
