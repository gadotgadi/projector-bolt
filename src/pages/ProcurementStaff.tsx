
import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ProcurementStaffTable from '../components/procurement-staff/ProcurementStaffTable';

interface ProcurementWorker {
  id: number;
  employeeId: string;
  fullName: string;
  roleCode: number;
  roleName: string;
  procurementTeam: string;
  availableWorkDays: number;
}

const ProcurementStaff: React.FC = () => {
  const { toast } = useToast();

  // Mock data - only role codes 2 and 3 (Team Leader and Procurement Officer)
  const [workers, setWorkers] = useState<ProcurementWorker[]>([
    {
      id: 1,
      employeeId: '1001',
      fullName: 'אלברט',
      roleCode: 2,
      roleName: 'ראש צוות',
      procurementTeam: 'יעודי',
      availableWorkDays: 190
    },
    {
      id: 2,
      employeeId: '1002',
      fullName: 'בצלאל',
      roleCode: 3,
      roleName: 'קניין',
      procurementTeam: 'טכנולוגי',
      availableWorkDays: 180
    },
    {
      id: 3,
      employeeId: '1003',
      fullName: 'גדעון',
      roleCode: 3,
      roleName: 'קניין',
      procurementTeam: 'לוגיסטי',
      availableWorkDays: 200
    },
    {
      id: 4,
      employeeId: '1004',
      fullName: 'דהור',
      roleCode: 3,
      roleName: 'קניין',
      procurementTeam: 'יעודי',
      availableWorkDays: 170
    },
    {
      id: 5,
      employeeId: '1005',
      fullName: 'ויקטור',
      roleCode: 3,
      roleName: 'קניין',
      procurementTeam: 'טכנולוגי',
      availableWorkDays: 190
    },
    {
      id: 6,
      employeeId: '1006',
      fullName: 'זבד',
      roleCode: 3,
      roleName: 'קניין',
      procurementTeam: 'טכנולוגי',
      availableWorkDays: 200
    },
    {
      id: 7,
      employeeId: '1007',
      fullName: 'טוהר',
      roleCode: 3,
      roleName: 'קניין',
      procurementTeam: 'מחשוב',
      availableWorkDays: 190
    },
    {
      id: 8,
      employeeId: '1008',
      fullName: 'יהיד',
      roleCode: 3,
      roleName: 'קניין',
      procurementTeam: 'הנדסי',
      availableWorkDays: 170
    },
    {
      id: 9,
      employeeId: '1009',
      fullName: 'לביא',
      roleCode: 3,
      roleName: 'קניין',
      procurementTeam: 'ביטחוני',
      availableWorkDays: 80
    },
    {
      id: 10,
      employeeId: '1010',
      fullName: 'משה',
      roleCode: 3,
      roleName: 'קניין',
      procurementTeam: 'מחשוב',
      availableWorkDays: 190
    },
    {
      id: 11,
      employeeId: '1011',
      fullName: 'שרית',
      roleCode: 3,
      roleName: 'קניין',
      procurementTeam: 'הנדסי',
      availableWorkDays: 160
    }
  ]);

  const procurementTeams = [
    'יעודי',
    'טכנולוגי', 
    'לוגיסטי',
    'מחשוב',
    'הנדסי',
    'ביטחוני'
  ];

  const handleWorkerUpdate = (workerId: number, field: string, value: any) => {
    setWorkers(prev => prev.map(worker => {
      if (worker.id === workerId) {
        const updatedWorker = { ...worker };
        
        if (field === 'roleCode') {
          updatedWorker.roleCode = value;
          updatedWorker.roleName = value === 2 ? 'ראש צוות' : 'קניין';
        } else if (field === 'procurementTeam') {
          updatedWorker.procurementTeam = value;
        } else if (field === 'availableWorkDays') {
          updatedWorker.availableWorkDays = Math.max(1, Math.min(300, parseInt(value) || 0));
        } else if (field === 'fullName') {
          updatedWorker.fullName = value;
        }
        
        return updatedWorker;
      }
      return worker;
    }));

    toast({
      title: "עודכן בהצלחה",
      description: "פרטי העובד נשמרו במערכת"
    });
  };

  console.log('ProcurementStaff component is rendering');

  return (
    <AppLayout currentRoute="/procurement-staff">
      <div className="space-y-6">
        <Card>
          <CardContent>
            <ProcurementStaffTable
              workers={workers}
              procurementTeams={procurementTeams}
              onWorkerUpdate={handleWorkerUpdate}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProcurementStaff;
