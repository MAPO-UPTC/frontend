import React from 'react';
import { ReturnsDashboard } from '../../components/ReturnsManagement/ReturnsDashboard';
import PermissionGate from '../../components/PermissionGate/PermissionGate';
import { Entity, Action } from '../../constants';
import './Returns.css';

export const Returns: React.FC = () => {
  return (
    <PermissionGate
      entity={Entity.SALES_ORDERS}
      action={Action.READ}
      fallback={(
        <div className="returns-page-container">
          <div className="no-permission-message">
            <h3>⚠️ Sin permisos para gestionar devoluciones</h3>
            <p>No tienes permisos suficientes para acceder al módulo de devoluciones.</p>
          </div>
        </div>
      ) as any}
      showLoading={true}
    >
      <div className="returns-page-container">
        <div className="returns-header">
          <h1>Gestión de Devoluciones</h1>
          <p>Administra y procesa las devoluciones de productos</p>
        </div>
        <ReturnsDashboard />
      </div>
    </PermissionGate>
  );
};
