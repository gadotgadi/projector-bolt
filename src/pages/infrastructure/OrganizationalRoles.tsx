
import React, { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SystemTableManager from '../../components/system/SystemTableManager';
import { OrganizationalRole } from '../../types';

const OrganizationalRoles: React.FC = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState<OrganizationalRole[]>([
    { 
      id: 1, 
      roleCode: 1, 
      description: 'מנהל רכש',
      permissions: 'הרשאות מלאות לניהול כל תהליכי הרכש'
    },
    { 
      id: 2, 
      roleCode: 2, 
      description: 'ראש צוות',
      permissions: 'ניהול צוות קניינים ומעקב משימות'
    },
    { 
      id: 3, 
      roleCode: 3, 
      description: 'קניין',
      permissions: 'ביצוע פעילויות רכש ומעקב משימות'
    }
  ]);

  const fields = [
    { key: 'roleCode', label: 'קוד תפקיד (0-6)', type: 'number' as const, required: true },
    { key: 'description', label: 'תיאור תפקיד', type: 'text' as const, required: true },
    { key: 'permissions', label: 'פירוט הרשאות', type: 'text' as const, required: false }
  ];

  const handleAdd = (record: Omit<OrganizationalRole, 'id'>) => {
    const id = Math.max(...records.map(r => r.id), 0) + 1;
    setRecords(prev => [...prev, { ...record, id }]);
  };

  const handleUpdate = (id: number, record: Partial<OrganizationalRole>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...record } : r));
  };

  const handleDelete = (id: number) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <AppLayout currentRoute="/infrastructure-maintenance">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/infrastructure-maintenance')}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה לתחזוקת תשתיות
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 text-right">
              תפקידים ארגוניים
            </h1>
          </div>
          
          <SystemTableManager
            title="תפקידים ארגוניים"
            description="Organizational Role - הגדרת התפקידים והרשאות במערכת"
            fields={fields}
            records={records}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default OrganizationalRoles;
