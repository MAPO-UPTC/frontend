import { useCallback } from 'react';
import { useMAPOStore } from '../store';

export const useAuth = () => {
  const {
    auth,
    login,
    logout,
    initializeAuth,
    addNotification
  } = useMAPOStore();

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      await login(email, password);
      return true;
    } catch (error) {
      return false;
    }
  }, [login]);

  const handleLogout = useCallback(() => {
    logout();
    addNotification({
      type: 'info',
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión exitosamente',
    });
  }, [logout, addNotification]);

  const initialize = useCallback(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    // State
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    
    // Actions
    login: handleLogin,
    logout: handleLogout,
    initialize,
  };
};