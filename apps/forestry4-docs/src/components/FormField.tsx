import React from 'react';
import { FormControl, FormErrorMessage, FormLabel, Input, Select } from '@chakra-ui/react';

interface FormFieldProps {
  name: string;
  label: string;
  value: string | number;
  type?: 'text' | 'number' | 'email' | 'select';
  error?: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  value,
  type = 'text',
  error,
  onChange,
  options,
  placeholder,
}) => {
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel>{label}</FormLabel>
      {type === 'select' ? (
        <Select name={name} value={value} onChange={onChange}>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ) : (
        <Input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default FormField;
