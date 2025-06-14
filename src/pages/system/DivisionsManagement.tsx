
import React, { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import SystemTableManager from '../../components/system/SystemTableManager';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DivisionRecord {
  id: number;
  name: string;
  isInternal: boolean;
}

const DivisionsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<DivisionRecord[]>([
    { id: 1, name: 'אגף תפעול', isInternal: true },
    { id: 2, name: 'אגף שיווק', isInternal: true },
    { id: 3, name: 'לקוח חיצוני א', isInternal: false }
  ]);

  const fields = [
    { key: 'name', label: 'שם אגף לקוח', type: 'text' as const, required: true },
    { key: 'isInternal', label: 'שיוך ארגוני (true=פנימי, false=חיצוני)', type: 'text' as const, required: true }
  ];

  const handleAdd = (newRecord: Omit<DivisionRecord, 'id'>) => {
    const id = Math.max(...records.map(r => r.id), 0) + 1;
    // Convert string to boolean for isInternal field
    const processedRecord = {
      ...newRecord,
      isInternal: String(newRecord.isInternal) === 'true'
    };
    setRecords(prev => [...prev, { ...processedRecord, id }]);
  };

  const handleUpdate = (id: number, updatedRecord: Partial<DivisionRecord>) => {
    // Convert string to boolean for isInternal field
    const processedRecord = {
      ...updatedRecord,
      isInternal: String(updatedRecord.isInternal) === 'true'
    };
    setRecords(prev => prev.map(record => 
      record.id === id ? { ...record, ...processedRecord } : record
    ));
  };

  const handleDelete = (id: number) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  };

  // Transform records for display - show boolean as text
  const displayRecords = records.map(record => ({
    ...record,
    isInternal: record.isInternal ? 'פנימי' : 'חיצוני'
  }));

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
              ניהול אגפים
            </h1>
          </div>
          
          <SystemTableManager
            title="Division"
            description="ניהול רשימת הלקוחות והאגפים הפנימיים"
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

export default DivisionsManagement;
