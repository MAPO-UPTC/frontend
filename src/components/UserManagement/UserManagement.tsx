import React, { useEffect, useState } from 'react';
import { useUserManagement } from '../../hooks/useUserManagement';
import { UserWithRoles } from '../../types';
import { UserDetailModal } from './UserDetailModal';
import './UserManagement.css';

export const UserManagement: React.FC = () => {
  const { users, loading, error, loadUsers, searchUsers } = useUserManagement();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRoles[]>([]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchUsers(searchQuery);
      setFilteredUsers(Array.isArray(results) ? results : []);
    } else {
      setFilteredUsers(Array.isArray(users) ? users : []);
    }
  }, [searchQuery, users, searchUsers]);

  const handleUserClick = (user: UserWithRoles) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const getRoleBadgeClass = (roleName: string) => {
    switch (roleName) {
      case 'SUPERADMIN':
        return 'role-badge superadmin';
      case 'ADMIN':
        return 'role-badge admin';
      case 'USER':
        return 'role-badge user';
      default:
        return 'role-badge';
    }
  };

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>Gestión de Usuarios</h2>
        <p className="header-subtitle">
          Administra los usuarios y sus roles en el sistema
        </p>
      </div>

      <div className="search-section">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, email o documento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery('')}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <p>
            {searchQuery
              ? 'No se encontraron usuarios con ese criterio de búsqueda'
              : 'No hay usuarios registrados en el sistema'}
          </p>
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map((user) => (
            <div
              key={user.user_id}
              className="user-card"
              onClick={() => handleUserClick(user)}
            >
              <div className="user-card-header">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                  {user.last_name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <h3 className="user-name">
                    {user.name} {user.last_name}
                  </h3>
                  <p className="user-email">{user.email}</p>
                  {user.document_number && (
                    <p className="user-document">
                      {user.document_type}: {user.document_number}
                    </p>
                  )}
                </div>
              </div>

              <div className="user-roles">
                <span className="roles-label">Roles:</span>
                <div className="roles-list">
                  {user.roles.map((role, index) => (
                    <span key={index} className={getRoleBadgeClass(role)}>
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="user-card-footer">
                <button className="edit-user-btn">
                  Gestionar Roles →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={handleCloseModal}
          onUpdate={loadUsers}
        />
      )}
    </div>
  );
};
