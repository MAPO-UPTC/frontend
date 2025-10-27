import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { UserWithRoles, RoleName } from '../types';

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getAllUsers();
      console.log('📊 Users data received:', response);
      
      // El backend devuelve { users: [...], total: n }
      if (response && Array.isArray(response.users)) {
        setUsers(response.users);
      } else {
        console.error('❌ Unexpected data format:', response);
        setUsers([]);
      }
    } catch (err: any) {
      const errorMsg = err.detail || 'Error al cargar usuarios';
      setError(errorMsg);
      console.error('Error loading users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const assignRole = useCallback(async (userId: string, role: RoleName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.assignRoleToUser(userId, role);
      
      // Actualizar la lista de usuarios localmente
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.user_id === userId ? response.user : user
        )
      );
      
      return response;
    } catch (err: any) {
      setError(err.detail || 'Error al asignar rol');
      console.error('Error assigning role:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeRole = useCallback(async (userId: string, role: RoleName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.removeRoleFromUser(userId, role);
      
      // Actualizar la lista de usuarios localmente
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.user_id === userId ? response.user : user
        )
      );
      
      return response;
    } catch (err: any) {
      setError(err.detail || 'Error al remover rol');
      console.error('Error removing role:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRoles = useCallback(async (userId: string, roles: RoleName[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.updateUserRoles(userId, roles);
      
      // Actualizar la lista de usuarios localmente
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.user_id === userId ? response.user : user
        )
      );
      
      return response;
    } catch (err: any) {
      setError(err.detail || 'Error al actualizar roles');
      console.error('Error updating roles:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback((query: string): UserWithRoles[] => {
    if (!query.trim()) return users;
    
    const searchLower = query.toLowerCase();
    return users.filter(user =>
      user.email.toLowerCase().includes(searchLower) ||
      user.name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      (user.document_number?.toLowerCase().includes(searchLower))
    );
  }, [users]);

  return {
    users,
    loading,
    error,
    loadUsers,
    assignRole,
    removeRole,
    updateRoles,
    searchUsers,
  };
};
