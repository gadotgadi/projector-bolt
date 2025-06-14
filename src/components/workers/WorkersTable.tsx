
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface WorkerRecord {
  id: number;
  employeeId: string;
  roleCode: number;
  fullName: string;
  roleDescription?: string;
  divisionId?: number;
  departmentId?: number;
  procurementTeam?: string;
  password: string;
  availableWorkDays?: string;
  email?: string;
  divisionName?: string;
  departmentName?: string;
}

interface Division {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  divisionId: number;
}

interface ProcurementTeam {
  id: number;
  name: string;
}

interface OrganizationalRole {
  id: number;
  roleCode: number;
  description: string;
  permissions?: string;
}

interface WorkersTableProps {
  records: WorkerRecord[];
  onEdit: (record: WorkerRecord) => void;
  onDelete: (id: number) => void;
  divisions: Division[];
  departments: Department[];
  procurementTeams: ProcurementTeam[];
  organizationalRoles: OrganizationalRole[];
}

type SortField = 'roleCode' | 'divisionName' | 'departmentName' | 'procurementTeam' | 'employeeId' | 'fullName';
type SortDirection = 'asc' | 'desc';

const WorkersTable: React.FC<WorkersTableProps> = ({
  records,
  onEdit,
  onDelete,
  divisions,
  departments,
  procurementTeams,
  organizationalRoles
}) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState({
    roleCode: 'all',
    divisionName: 'all',
    departmentName: 'all',
    procurementTeam: 'all'
  });

  const getRoleDescription = (roleCode: number) => {
    const role = organizationalRoles.find(r => r.roleCode === roleCode);
    return role ? role.description : roleCode.toString();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      roleCode: 'all',
      divisionName: 'all',
      departmentName: 'all',
      procurementTeam: 'all'
    });
  };

  // Apply filters
  let filteredRecords = records.filter(record => {
    return (
      (filters.roleCode === 'all' || record.roleCode.toString() === filters.roleCode) &&
      (filters.divisionName === 'all' || record.divisionName === filters.divisionName) &&
      (filters.departmentName === 'all' || record.departmentName === filters.departmentName) &&
      (filters.procurementTeam === 'all' || record.procurementTeam === filters.procurementTeam)
    );
  });

  // Apply sorting
  if (sortField) {
    filteredRecords = [...filteredRecords].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return null;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 inline mr-1" /> : 
      <ChevronDown className="w-4 h-4 inline mr-1" />;
  };

  // Get unique values for filters
  const uniqueRoleCodes = [...new Set(records.map(r => r.roleCode))].sort();
  const uniqueDivisions = [...new Set(records.map(r => r.divisionName).filter(Boolean))].sort();
  const uniqueDepartments = [...new Set(records.map(r => r.departmentName).filter(Boolean))].sort();
  const uniqueProcurementTeams = [...new Set(records.map(r => r.procurementTeam).filter(Boolean))].sort();

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all');

  return (
    <div className="space-y-4">
      {/* Clear Filters Button - only show if there are active filters */}
      {hasActiveFilters && (
        <div className="flex justify-start">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            נקה מסננים
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-24">פעולות</TableHead>
              <TableHead className="text-right cursor-pointer hover:bg-gray-50 select-none" onClick={() => handleSort('employeeId')}>
                <div className="flex items-center justify-end">
                  {getSortIcon('employeeId')}
                  קוד עובד
                </div>
              </TableHead>
              <TableHead className="text-right min-w-[200px]">
                <div className="space-y-2">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('roleCode')}>
                    {getSortIcon('roleCode')}
                    תפקיד
                  </div>
                  <Select value={filters.roleCode} onValueChange={(value) => handleFilterChange('roleCode', value)}>
                    <SelectTrigger className="text-right h-7 text-xs">
                      <SelectValue placeholder="הכל" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">הכל</SelectItem>
                      {uniqueRoleCodes.map(code => (
                        <SelectItem key={code} value={code.toString()}>
                          {getRoleDescription(code)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableHead>
              <TableHead className="text-right cursor-pointer hover:bg-gray-50 select-none" onClick={() => handleSort('fullName')}>
                <div className="flex items-center justify-end">
                  {getSortIcon('fullName')}
                  שם מלא
                </div>
              </TableHead>
              <TableHead className="text-right">תיאור תפקיד</TableHead>
              <TableHead className="text-right min-w-[180px]">
                <div className="space-y-2">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('divisionName')}>
                    {getSortIcon('divisionName')}
                    אגף
                  </div>
                  <Select value={filters.divisionName} onValueChange={(value) => handleFilterChange('divisionName', value)}>
                    <SelectTrigger className="text-right h-7 text-xs">
                      <SelectValue placeholder="הכל" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">הכל</SelectItem>
                      {uniqueDivisions.map(division => (
                        <SelectItem key={division} value={division}>
                          {division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableHead>
              <TableHead className="text-right min-w-[180px]">
                <div className="space-y-2">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('departmentName')}>
                    {getSortIcon('departmentName')}
                    מחלקה
                  </div>
                  <Select value={filters.departmentName} onValueChange={(value) => handleFilterChange('departmentName', value)}>
                    <SelectTrigger className="text-right h-7 text-xs">
                      <SelectValue placeholder="הכל" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">הכל</SelectItem>
                      {uniqueDepartments.map(department => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableHead>
              <TableHead className="text-right min-w-[180px]">
                <div className="space-y-2">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('procurementTeam')}>
                    {getSortIcon('procurementTeam')}
                    צוות רכש
                  </div>
                  <Select value={filters.procurementTeam} onValueChange={(value) => handleFilterChange('procurementTeam', value)}>
                    <SelectTrigger className="text-right h-7 text-xs">
                      <SelectValue placeholder="הכל" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">הכל</SelectItem>
                      {uniqueProcurementTeams.map(team => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableHead>
              <TableHead className="text-right">ימי עבודה זמינים</TableHead>
              <TableHead className="text-right">Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                  {records.length === 0 ? 'אין רשומות להצגה' : 'לא נמצאו רשומות המתאימות למסנן'}
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(record)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(record.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{record.employeeId}</TableCell>
                  <TableCell className="text-right">{getRoleDescription(record.roleCode)}</TableCell>
                  <TableCell className="text-right">{record.fullName}</TableCell>
                  <TableCell className="text-right">{record.roleDescription || '-'}</TableCell>
                  <TableCell className="text-right">{record.divisionName || '-'}</TableCell>
                  <TableCell className="text-right">{record.departmentName || '-'}</TableCell>
                  <TableCell className="text-right">{record.procurementTeam || '-'}</TableCell>
                  <TableCell className="text-right">{record.availableWorkDays || '-'}</TableCell>
                  <TableCell className="text-right">{record.email || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {filteredRecords.length > 0 && (
        <div className="text-sm text-gray-500 text-right">
          מציג {filteredRecords.length} מתוך {records.length} רשומות
        </div>
      )}
    </div>
  );
};

export default WorkersTable;
