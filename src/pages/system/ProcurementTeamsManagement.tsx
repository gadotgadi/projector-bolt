
import React, { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import SystemTableManager from '../../components/system/SystemTableManager';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProcurementTeamRecord {
  id: number;
  name: string;
}

const ProcurementTeamsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ProcurementTeamRecord[]>([
    { id: 1, name: 'צוות רכש א' },
    { id: 2, name: 'צוות רכש ב' },
    { id: 3, name: 'צוות רכש מיוחד' }
  ]);

  const fields = [
    { key: 'name', label: 'שם צוות', type: 'text' as const, required: true }
  ];

  const handleAdd = (newRecord: Omit<ProcurementTeamRecord, 'id'>) => {
    const id = Math.max(...records.map(r => r.id), 0) + 1;
    setRecords(prev => [...prev, { ...newRecord, id }]);
  };

  const handleUpdate = (id: number, updatedRecord: Partial<ProcurementTeamRecord>) => {
    setRecords(prev => prev.map(record => 
      record.id === id ? { ...record, ...updatedRecord } : record
    ));
  };

  const handleDelete = (id: number) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  };

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
              ניהול צוותי רכש
            </h1>
          </div>
          
          <SystemTableManager
            title="Procurement Team"
            description="ניהול צוותי הרכש ביחידה"
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

export default ProcurementTeamsManagement;
