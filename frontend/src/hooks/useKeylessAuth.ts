import { useState, useEffect, useCallback } from 'react';
import keylessAuth, { KeylessUser } from '@/services/keylessAuth';

export const useKeylessAuth = () => {
  const [user, setUser] = useState<KeylessUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    try {
      const currentUser = keylessAuth.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (err) {
      console.error('Error checking existing session:', err);
      setError('Failed to restore session');
    }
  }, []);

  // Login with Google
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await keylessAuth.loginWithGoogle();
      // Note: This will redirect, so we won't reach here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle OAuth callback
  const handleCallback = useCallback(async (idToken: string) => {
    try {
      setLoading(true);
      setError(null);
      const loggedInUser = await keylessAuth.handleCallback(idToken);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Callback handling failed');
      console.error('Callback error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    keylessAuth.logout();
    setUser(null);
    setError(null);
  }, []);

  // Get user address
  const getUserAddress = useCallback(() => {
    return keylessAuth.getUserAddress();
  }, []);

  return {
    user,
    loading,
    error,
    isLoggedIn: !!user,
    loginWithGoogle,
    handleCallback,
    logout,
    getUserAddress
  };
};

export default useKeylessAuth;
