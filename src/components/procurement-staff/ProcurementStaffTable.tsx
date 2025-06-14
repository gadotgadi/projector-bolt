
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface ProcurementWorker {
  id: number;
  employeeId: string;
  fullName: string;
  roleCode: number;
  roleName: string;
  procurementTeam: string;
  availableWorkDays: number;
}

interface ProcurementStaffTableProps {
  workers: ProcurementWorker[];
  procurementTeams: string[];
  onWorkerUpdate: (workerId: number, field: string, value: any) => void;
}

const ProcurementStaffTable: React.FC<ProcurementStaffTableProps> = ({
  workers,
  procurementTeams,
  onWorkerUpdate
}) => {
  const handleNameChange = (workerId: number, value: string) => {
    onWorkerUpdate(workerId, 'fullName', value);
  };

  const handleRoleChange = (workerId: number, value: string) => {
    onWorkerUpdate(workerId, 'roleCode', parseInt(value));
  };

  const handleTeamChange = (workerId: number, value: string) => {
    onWorkerUpdate(workerId, 'procurementTeam', value);
  };

  const handleWorkDaysChange = (workerId: number, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 300) {
      onWorkerUpdate(workerId, 'availableWorkDays', numValue);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right w-32">שם</TableHead>
            <TableHead className="text-right w-32">תפקיד</TableHead>
            <TableHead className="text-right w-32">צוות</TableHead>
            <TableHead className="text-right w-40">ימי עבודה זמינים בשנה</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.map((worker) => (
            <TableRow key={worker.id}>
              <TableCell className="text-right">
                <Input
                  value={worker.fullName}
                  onChange={(e) => handleNameChange(worker.id, e.target.value)}
                  className="text-right border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                />
              </TableCell>
              <TableCell className="text-right">
                <Select
                  value={worker.roleCode.toString()}
                  onValueChange={(value) => handleRoleChange(worker.id, value)}
                >
                  <SelectTrigger className="text-right border-0 bg-transparent p-0 h-auto focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">ראש צוות</SelectItem>
                    <SelectItem value="3">קניין</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <Select
                  value={worker.procurementTeam}
                  onValueChange={(value) => handleTeamChange(worker.id, value)}
                >
                  <SelectTrigger className="text-right border-0 bg-transparent p-0 h-auto focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {procurementTeams.map((team) => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min="1"
                  max="300"
                  value={worker.availableWorkDays}
                  onChange={(e) => handleWorkDaysChange(worker.id, e.target.value)}
                  className="text-right border-0 bg-transparent p-0 h-auto focus-visible:ring-0 w-16"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProcurementStaffTable;
