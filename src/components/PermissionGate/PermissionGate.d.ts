import React from 'react';

export interface PermissionGateProps {
  entity?: string;
  action?: string;
  level?: string;
  roles?: string[];
  fallback?: React.ReactNode;
  children?: React.ReactNode;
  showLoading?: boolean;
  loadingComponent?: React.ReactNode;
}

declare const PermissionGate: React.FC<PermissionGateProps>;

export default PermissionGate;
