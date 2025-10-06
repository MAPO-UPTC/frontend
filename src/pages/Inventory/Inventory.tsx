import React from 'react';
import { InventoryDashboard } from '../../components/InventoryManagement/InventoryDashboard';
import './Inventory.css';

export const Inventory: React.FC = () => {
  return (
    <div className="inventory-page-container">
      <div className="inventory-header">
        <h1>Gestión de Inventario</h1>
        <p>Administra productos, stock y categorías</p>
      </div>
      <InventoryDashboard />
    </div>
  );
};