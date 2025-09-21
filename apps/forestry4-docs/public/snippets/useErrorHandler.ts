// Auto-generated snippet from: apps/forestry4-docs/src/hooks/useErrorHandler.ts
// Description: useErrorHandler hook for toast-based error handling
// Last synced: Sat Sep 20 21:09:30 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

export type FeedbackFn = (err: Error | string, title?: string) => void;

export function useErrorHandler() {
  const toast = useToast();

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

export default useErrorHandler;
