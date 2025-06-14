
import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import InfrastructureGrid from '../components/infrastructure/InfrastructureGrid';

const InfrastructureMaintenance: React.FC = () => {
  return (
    <AppLayout currentRoute="/infrastructure-maintenance">
      <div className="space-y-6">
        <InfrastructureGrid />
      </div>
    </AppLayout>
  );
};

export default InfrastructureMaintenance;
