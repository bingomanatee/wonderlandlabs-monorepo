import { useToast as useToastChakra } from '@chakra-ui/react';
import { useCallback } from 'react';

export type FeedbackFn = (err: Error | string, title?: string) => void;

export function useToast() {
  const toast = useToastChakra();

  const handleError = useCallback(
    (error: Error | string, title?: string) => {
      const errorMessage = typeof error === 'string' ? error : error.message;

      toast({
        title: title || 'Validation Error',
        description: errorMessage,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    },
    [toast]
  );

  const handleSuccess = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || 'Success',
        description: message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    [toast]
  );

  const handleWarning = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || 'Warning',
        description: message,
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
    },
    [toast]
  );

  return {
    handleError,
    handleSuccess,
    handleWarning,
  };
}

export default useToast;
