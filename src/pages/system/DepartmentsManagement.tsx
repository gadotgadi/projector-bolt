
import React, { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import SystemTableManager from '../../components/system/SystemTableManager';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DepartmentRecord {
  id: number;
  name: string;
  divisionId?: number;
}

const DepartmentsManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock divisions data - in a real app this would come from a data store
  const divisions = [
    { id: 1, name: 'אגף תפעול' },
    { id: 2, name: 'אגף שיווק' },
    { id: 3, name: 'לקוח חיצוני א' }
  ];
  
  const [records, setRecords] = useState<DepartmentRecord[]>([
    { id: 1, name: 'מחלקת הנדסה', divisionId: 1 },
    { id: 2, name: 'מחלקת איכות', divisionId: 1 },
    { id: 3, name: 'מחלקת שירות לקוחות', divisionId: 2 }
  ]);

  const fields = [
    { key: 'name', label: 'שם מחלקה', type: 'text' as const, required: true },
    { key: 'divisionId', label: 'שייכות לאגף (ID)', type: 'number' as const }
  ];

  const handleAdd = (newRecord: Omit<DepartmentRecord, 'id'>) => {
    const id = Math.max(...records.map(r => r.id), 0) + 1;
    setRecords(prev => [...prev, { ...newRecord, id }]);
  };

  const handleUpdate = (id: number, updatedRecord: Partial<DepartmentRecord>) => {
    setRecords(prev => prev.map(record => 
      record.id === id ? { ...record, ...updatedRecord } : record
    ));
  };

  const handleDelete = (id: number) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  };

  // Transform records for display - show division name instead of ID
  const displayRecords = records.map(record => {
    const division = divisions.find(div => div.id === record.divisionId);
    return {
      ...record,
      divisionId: division ? division.name : record.divisionId || '-'
    };
  });

  return (
    <AppLayout currentRoute="/system-settings">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/system-settings')}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה להגדרות מערכת
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 text-right">
              ניהול מחלקות
            </h1>
          </div>
          
          <SystemTableManager
            title="Department"
            description="ניהול רשימת המחלקות והגופים המקצועיים"
            fields={fields}
            records={displayRecords}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default DepartmentsManagement;
