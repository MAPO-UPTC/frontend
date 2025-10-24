import React from 'react';
import { UserManagement } from '../../components/UserManagement';
import PermissionGate from '../../components/PermissionGate/PermissionGate';
import './UserManagementPage.css';

export const UserManagementPage: React.FC = () => {
  return (
    <PermissionGate 
      roles={['SUPERADMIN']}
      fallback={
        <div className="access-denied">
          <h2>Acceso Denegado</h2>
          <p>Solo los Super Administradores pueden acceder a esta sección.</p>
        </div>
      }
    >
      <div className="user-management-page">
        <UserManagement />
      </div>
    </PermissionGate>
  );
};
