import React from 'react';
import { Link } from 'react-router-dom';
import { ReportsDashboard } from '../../components/ReportsDashboard/ReportsDashboard';
import PermissionGate from '../../components/PermissionGate/PermissionGate';
import { Entity, Action } from '../../constants';
import './Reports.css';

export const Reports: React.FC = () => {
  return (
    <PermissionGate
      entity={Entity.SALES_ORDERS}
      action={Action.READ}
      fallback={(
        <div className="reports-page">
          <div className="no-permission-message" style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#fff3cd',
            borderRadius: '8px',
            margin: '20px'
          }}>
            <h3>⚠️ Sin permisos para ver reportes</h3>
            <p>No tienes permisos suficientes para acceder al módulo de reportes.</p>
            <p>Contacta con un administrador si necesitas acceso.</p>
            <Link to="/products" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block', padding: '10px 20px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
              Volver a Productos
            </Link>
          </div>
        </div>
      ) as any}
      showLoading={true}
      loadingComponent={(
        <div className="reports-page">
          <div className="loading" style={{ textAlign: 'center', padding: '40px' }}>
            Verificando permisos...
          </div>
        </div>
      ) as any}
    >
      <div className="reports-page">
        <ReportsDashboard />
      </div>
    </PermissionGate>
  );
};