
import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import SystemSettingsGrid from '../components/system/SystemSettingsGrid';

const SystemSettings: React.FC = () => {
  return (
    <AppLayout currentRoute="/system-settings">
      <div className="space-y-6">
        <SystemSettingsGrid />
      </div>
    </AppLayout>
  );
};

export default SystemSettings;
