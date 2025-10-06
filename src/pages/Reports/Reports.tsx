import React from 'react';
import { ReportsDashboard } from '../../components/ReportsDashboard/ReportsDashboard';
import './Reports.css';

export const Reports: React.FC = () => {
  return (
    <div className="reports-page">
      <ReportsDashboard />
    </div>
  );
};