import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import messageState, { messageLevels } from '@/state/messageState.ts';

export function useRequireAuth(redirectTo: string = '/', validateToken: boolean = false) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const navigate = useNavigate();
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      // Wait for Clerk to finish loading
      if (!isLoaded) {
        return;
      }

      // If user is not signed in, redirect them
      if (!isSignedIn) {
        navigate(redirectTo, { replace: true });
        messageState.acts.addMessage(
          'Unauthorized',
          'You must be logged in to view this page; please (re) log in ',
          messageLevels.WARNING,
          3000
        );
        return;
      }

      // Optionally validate the token
      if (validateToken) {
        try {
          const token = await getToken();
          if (!token) {
            navigate(redirectTo, { replace: true });
            setTokenValid(false);
            messageState.acts.addMessage(
              'Unauthorized',
              'Your session has expired; please (re) log in ',
              messageLevels.WARNING,
              3000
            );
            return;
          }
          setTokenValid(true);
        } catch (error) {
          messageState.acts.addMessage(
            'Unauthorized',
            'Your session cannot be validated; please (re) log in ',
            messageLevels.WARNING,
            3000
          );
          navigate(redirectTo, { replace: true });
          setTokenValid(false);
        }
      } else {
        setTokenValid(true);
      }
    }

    checkAuth();
  }, [isLoaded, isSignedIn, navigate, redirectTo, validateToken, getToken]);

  return {
    isLoaded,
    isSignedIn,
    isAuthenticated: isLoaded && isSignedIn && (validateToken ? tokenValid === true : true),
    tokenValid,
  };
}
