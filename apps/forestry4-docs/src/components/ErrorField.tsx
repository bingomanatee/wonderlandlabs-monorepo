import React from 'react';
import { Text, VStack } from '@chakra-ui/react';

type ErrorFieldProps = {
  field: any;
  branch: any;
  fieldType: 'username' | 'email' | 'age';
};

const ErrorField: React.FC<ErrorFieldProps> = ({ field, branch, fieldType }) => {
  if (!field.value) return null;

  const renderUsernameInfo = () => {
    const quality = branch.$res.get('usernameQuality')?.(field);
    const chars = branch.$res.get('characterAnalysis')?.(field);

    return (
      <>
        <Text fontSize="xs" color="green.600">
          ✓ Length: {quality?.length} characters{' '}
          {quality?.hasMinLength && quality?.hasMaxLength ? '(good)' : '(needs 3-20)'}
        </Text>
        <Text fontSize="xs" color={quality?.isAvailable ? 'green.600' : 'red.500'}>
          {quality?.isAvailable ? '✓ Username available' : '✗ Username reserved'}
        </Text>
        <Text fontSize="xs" color="blue.600">
          Format: {chars?.hasLetters ? 'Letters' : ''} {chars?.hasNumbers ? '+ Numbers' : ''}{' '}
          {chars?.isAlphanumeric ? '(clean)' : '(special chars)'}
        </Text>
      </>
    );
  };

  const renderEmailInfo = () => {
    if (!field.value.includes('@')) return null;

    const domain = branch.$res.get('domainAnalysis')?.(field);
    const format = branch.$res.get('formatQuality')?.(field);

    return (
      <>
        <Text fontSize="xs" color="blue.600">
          Provider:{' '}
          {domain?.isGmail
            ? 'Gmail'
            : domain?.isOutlook
              ? 'Outlook'
              : domain?.isCorporate
                ? 'Corporate'
                : 'Other'}{' '}
          ({domain?.domain})
        </Text>
        <Text fontSize="xs" color={domain?.isDisposable ? 'red.500' : 'green.600'}>
          {domain?.isDisposable ? '⚠️ Disposable email detected' : '✓ Permanent email provider'}
        </Text>
        <Text fontSize="xs" color={format?.hasValidFormat ? 'green.600' : 'orange.500'}>
          Format: {format?.hasValidFormat ? '✓ Valid email format' : '⚠️ Check email format'}
        </Text>
      </>
    );
  };

  const renderAgeInfo = () => {
    if (field.value <= 0) return null;

    const coppaCompliant = branch.$res.get('coppaCompliant')?.(field);
    const quality = branch.$res.get('dataQuality')?.(field);

    return (
      <>
        <Text fontSize="xs" color={coppaCompliant ? 'green.600' : 'red.500'}>
          {coppaCompliant ? '✓ COPPA compliant (13+)' : '❌ Under 13 - COPPA restricted'}
        </Text>
        <Text fontSize="xs" color={quality?.isRealistic ? 'green.600' : 'orange.500'}>
          {quality?.isRealistic ? '✓ Realistic age' : '⚠️ Age seems unrealistic'}
        </Text>
        <Text fontSize="xs" color="blue.600">
          Status: {quality?.isComplete ? 'Complete' : 'Incomplete'} •{' '}
          {quality?.isLegal ? 'Legal' : 'Restricted'}
        </Text>
      </>
    );
  };

  const renderFieldInfo = () => {
    switch (fieldType) {
      case 'username':
        return renderUsernameInfo();
      case 'email':
        return renderEmailInfo();
      case 'age':
        return renderAgeInfo();
      default:
        return null;
    }
  };

  return (
    <VStack align="start" mt={2} spacing={1}>
      {renderFieldInfo()}
    </VStack>
  );
};

export default ErrorField;
