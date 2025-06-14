
import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import InfrastructureGrid from '../components/infrastructure/InfrastructureGrid';

const InfrastructureMaintenance: React.FC = () => {
  return (
    <AppLayout currentRoute="/infrastructure-maintenance">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 text-right mb-2">
            תחזוקת תשתיות
          </h1>
          <p className="text-gray-600 text-right mb-6">
            ניהול טבלאות התשתית הארגונית והמדיניות של המערכת
          </p>
          
          <InfrastructureGrid />
        </div>
      </div>
    </AppLayout>
  );
};

export default InfrastructureMaintenance;
