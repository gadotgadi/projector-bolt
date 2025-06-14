
import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import SystemSettingsGrid from '../components/system/SystemSettingsGrid';

const SystemSettings: React.FC = () => {
  return (
    <AppLayout currentRoute="/system-settings">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 text-right mb-2">
            הגדרות מערכת
          </h1>
          <p className="text-gray-600 text-right mb-6">
            ניהול טבלאות התשתית של המערכת
          </p>
          
          <SystemSettingsGrid />
        </div>
      </div>
    </AppLayout>
  );
};

export default SystemSettings;
