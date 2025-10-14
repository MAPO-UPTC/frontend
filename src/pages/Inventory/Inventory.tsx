import React from 'react';
import { Link } from 'react-router-dom';
import { InventoryDashboard } from '../../components/InventoryManagement/InventoryDashboard';
import PermissionGate from '../../components/PermissionGate/PermissionGate';
import { Entity, Action } from '../../constants';
import './Inventory.css';

export const Inventory: React.FC = () => {
  return (
    <PermissionGate
      entity={Entity.INVENTORY}
      action={Action.READ}
      fallback={(
        <div className="inventory-page-container">
          <div className="no-permission-message" style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#fff3cd',
            borderRadius: '8px',
            margin: '20px'
          }}>
            <h3>⚠️ Sin permisos para gestionar inventario</h3>
            <p>No tienes permisos suficientes para acceder al módulo de inventario.</p>
            <p>Contacta con un administrador si necesitas acceso.</p>
            <Link to="/products" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block', padding: '10px 20px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
              Volver a Productos
            </Link>
          </div>
        </div>
      ) as any}
      showLoading={true}
      loadingComponent={(
        <div className="inventory-page-container">
          <div className="loading" style={{ textAlign: 'center', padding: '40px' }}>
            Verificando permisos...
          </div>
        </div>
      ) as any}
    >
      <div className="inventory-page-container">
        <div className="inventory-header">
          <h1>Gestión de Inventario</h1>
          <p>Administra productos, stock y categorías</p>
        </div>
        <InventoryDashboard />
      </div>
    </PermissionGate>
  );
};