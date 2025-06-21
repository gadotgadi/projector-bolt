import React, { useState } from 'react';
import { Program, TaskStatus, STATUS_CONFIG, PLANNING_SOURCE_CONFIG, CURRENCY_CONFIG } from '../../types';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../auth/AuthProvider';

// Mock data for dropdowns
const mockRequesters = [
  { id: 5, fullName: 'רחל אברהם' },
  { id: 6, fullName: 'יוסי לוי' },
  { id: 7, fullName: 'מירי דוד' },
  { id: 8, fullName: 'דני רוזן' }
];

const mockDivisions = [
  { id: 1, name: 'לוגיסטיקה' },
  { id: 2, name: 'טכנולוגיה' },
  { id: 3, name: 'מחקר ופיתוח' },
  { id: 4, name: 'משאבי אנוש' },
  { id: 5, name: 'מכירות' },
  { id: 6, name: 'תפעול' }
];

const mockDepartments = [
  { id: 1, name: 'רכש וחוזים' },
  { id: 2, name: 'תפעול ותחזוקה' },
  { id: 3, name: 'מערכות מידע' },
  { id: 4, name: 'פיתוח תוכנה' },
  { id: 5, name: 'מחקר' },
  { id: 6, name: 'פיתוח' }
];

const mockDomains = [
  { id: 1, description: 'רכש לוגיסטי' },
  { id: 2, description: 'רכש טכנולוגי' },
  { id: 3, description: 'שירותים מקצועיים' },
  { id: 4, description: 'תחזוקה ותפעול' },
  { id: 5, description: 'ציוד משרדי' },
  { id: 6, description: 'תוכנה ומערכות' }
];

const mockOfficers = [
  { id: 3, fullName: 'שרה לוי', roleCode: 2, team: 'צוות טכנולוגי' },
  { id: 4, fullName: 'אבי כהן', roleCode: 3, team: 'צוות לוגיסטי' },
  { id: 5, fullName: 'דוד משה', roleCode: 3, team: 'צוות טכנולוגי' },
  { id: 6, fullName: 'רונית כהן', roleCode: 3, team: 'צוות לוגיסטי' }
];

const mockTeams = [
  { id: 1, name: 'יעודי' },
  { id: 2, name: 'טכנולוגי' },
  { id: 3, name: 'לוגיסטי' },
  { id: 4, name: 'מחשוב' },
  { id: 5, name: 'הנדסי' },
  { id: 6, name: 'ביטחוני' }
];

interface ProgramFormProps {
  program: Program;
  canEdit: boolean;
  onProgramUpdate: (program: Program) => void;
  isEditing?: boolean;
  onSave?: (updatedProgram: Program) => void;
  onCancel?: () => void;
}

const ProgramForm: React.FC<ProgramFormProps> = ({ program, canEdit, onProgramUpdate }) => {
  const [formData, setFormData] = useState(program);
  const { user } = useAuth();

  const handleChange = (field: keyof Program, value: any) => {
    const updatedProgram = { ...formData, [field]: value, lastUpdate: new Date() };
    setFormData(updatedProgram);
    onProgramUpdate(updatedProgram);
  };

  // Get user permissions based on role and status
  const getUserPermissions = () => {
    const roleCode = user?.roleCode;
    const status = program.status;
    
    return {
      canEditPlanningSource: roleCode === 1, // מנהל רכש בלבד
      canEditDomain: roleCode === 1, // מנהל רכש בלבד
      canEditComplexity: roleCode === 1 && ['Open', 'Plan'].includes(status), // מנהל רכש בסטטוס Open/Plan
      canEditOfficer: getOfficerEditPermission(roleCode, status),
      canEditTeam: roleCode === 1, // מנהל רכש בלבד
      canEditStartDate: roleCode === 1 && ['Open', 'Plan'].includes(status), // מנהל רכש בסטטוס Open/Plan
      canEditPlanningNotes: roleCode === 1, // מנהל רכש בלבד
      canEditOfficerNotes: [1, 2, 3].includes(roleCode || 0), // מנהל רכש, ראש צוות, קניין
      canEditStatus: getStatusEditPermission(roleCode, status),
      canEditRequester: roleCode === 1, // מנהל רכש בלבד
      canEditDivision: roleCode === 1, // מנהל רכש בלבד
      canEditDepartment: roleCode === 1 // מנהל רכש בלבד
    };
  };

  const getOfficerEditPermission = (roleCode?: number, status?: string) => {
    // This would check the Permissions table in a real implementation
    const assignPermissions = 'Manager only'; // Mock value
    
    if (assignPermissions === 'Manager only') {
      return roleCode === 1;
    } else if (assignPermissions === 'Team leader') {
      return roleCode === 1 || roleCode === 2;
    }
    return false;
  };

  const getStatusEditPermission = (roleCode?: number, status?: string) => {
    if (roleCode === 1) { // מנהל רכש
      return ['Complete', 'Freeze'].includes(status || '');
    } else if (roleCode === 2) { // ראש צוות
      // This would check the Permissions table in a real implementation
      const closePermissions = 'Team leader'; // Mock value
      return status === 'Complete' && closePermissions === 'Team leader';
    }
    return false;
  };

  const permissions = getUserPermissions();

  const getAvailableStatusOptions = () => {
    const roleCode = user?.roleCode;
    const currentStatus = program.status;
    
    if (roleCode === 1) { // מנהל רכש
      if (currentStatus === 'Complete') {
        return ['Complete', 'Done', 'Freeze', 'Cancel'];
      } else if (currentStatus === 'Freeze') {
        // Check if can return to previous status based on station completion
        const hasStations = program.stations && program.stations.length > 0;
        const completedStations = program.stations?.filter(s => s.completionDate) || [];
        const assignedStations = program.stations?.filter(s => s.activityId) || [];
        
        const options = ['Freeze', 'Cancel'];
        
        if (!hasStations) {
          options.push('Open');
        } else if (completedStations.length === 0) {
          options.push('Plan');
        } else if (completedStations.length < assignedStations.length) {
          options.push('In Progress');
        } else if (completedStations.length === assignedStations.length) {
          options.push('Done', 'Complete');
        }
        
        return options;
      } else if (['In Progress', 'Plan', 'Open'].includes(currentStatus)) {
        return [currentStatus, 'Freeze', 'Cancel'];
      }
    } else if (roleCode === 2 && currentStatus === 'Complete') { // ראש צוות
      const closePermissions = 'Team leader'; // Mock value
      if (closePermissions === 'Team leader') {
        return ['Complete', 'Done'];
      }
    }
    
    return [currentStatus]; // No changes allowed
  };

  const getAvailableOfficers = () => {
    if (user?.roleCode === 2) { // ראש צוות
      // Show only officers from the same team
      return mockOfficers.filter(officer => officer.team === user.procurementTeam);
    }
    return mockOfficers; // מנהל רכש sees all officers
  };

  const getAvailableTeams = () => {
    if (user?.roleCode === 2) { // ראש צוות
      // Show only user's team
      return mockTeams.filter(team => team.name === user.procurementTeam);
    }
    return mockTeams; // מנהל רכש sees all teams
  };

  const availableStatusOptions = getAvailableStatusOptions();

  return (
    <div className="space-y-6">
      {/* Row 1: Title and Description */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-right">כותרת המשימה *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            disabled={!canEdit}
            className="text-right"
            maxLength={25}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-right">פירוט המשימה</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={!canEdit}
            className="text-right min-h-[80px]"
            rows={3}
          />
        </div>
      </div>

      {/* Row 2: Work Year and Quarter */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="workYear" className="text-sm font-medium text-right">שנת עבודה *</Label>
          <Input
            id="workYear"
            type="number"
            value={formData.workYear}
            onChange={(e) => handleChange('workYear', Number(e.target.value))}
            disabled={!canEdit}
            className="text-right"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="requiredQuarter" className="text-sm font-medium text-right">רבעון נדרש *</Label>
          <Input
            id="requiredQuarter"
            type="date"
            value={formData.requiredQuarter ? formData.requiredQuarter.toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange('requiredQuarter', e.target.value ? new Date(e.target.value) : new Date())}
            disabled={!canEdit}
            className="text-right"
            required
          />
        </div>
      </div>

      {/* Row 3: Requester and Division */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="requesterName" className="text-sm font-medium text-right">גורם דורש *</Label>
          {permissions.canEditRequester ? (
            <Select
              value={formData.requesterName}
              onValueChange={(value) => handleChange('requesterName', value)}
              disabled={!canEdit}
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="בחר גורם דורש" />
              </SelectTrigger>
              <SelectContent>
                {mockRequesters.map(requester => (
                  <SelectItem key={requester.id} value={requester.fullName}>
                    {requester.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="requesterName"
              value={formData.requesterName}
              disabled
              className="text-right bg-gray-50"
              required
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="divisionName" className="text-sm font-medium text-right">אגף *</Label>
          {permissions.canEditDivision ? (
            <Select
              value={formData.divisionName}
              onValueChange={(value) => handleChange('divisionName', value)}
              disabled={!canEdit}
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="בחר אגף" />
              </SelectTrigger>
              <SelectContent>
                {mockDivisions.map(division => (
                  <SelectItem key={division.id} value={division.name}>
                    {division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="divisionName"
              value={formData.divisionName}
              disabled
              className="text-right bg-gray-50"
              required
            />
          )}
        </div>
      </div>

      {/* Row 4: Department and Domain */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="departmentName" className="text-sm font-medium text-right">מחלקה</Label>
          {permissions.canEditDepartment ? (
            <Select
              value={formData.departmentName || ''}
              onValueChange={(value) => handleChange('departmentName', value)}
              disabled={!canEdit}
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="בחר מחלקה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ללא מחלקה</SelectItem>
                {mockDepartments.map(department => (
                  <SelectItem key={department.id} value={department.name}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="departmentName"
              value={formData.departmentName || ''}
              disabled
              className="text-right bg-gray-50"
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="domainName" className="text-sm font-medium text-right">תחום רכש</Label>
          {permissions.canEditDomain ? (
            <Select
              value={formData.domainName || ''}
              onValueChange={(value) => handleChange('domainName', value)}
              disabled={!canEdit}
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="בחר תחום רכש" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ללא תחום</SelectItem>
                {mockDomains.map(domain => (
                  <SelectItem key={domain.id} value={domain.description}>
                    {domain.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="domainName"
              value={formData.domainName || ''}
              disabled
              className="text-right bg-gray-50"
            />
          )}
        </div>
      </div>

      {/* Row 5: Amount and Currency */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="estimatedAmount" className="text-sm font-medium text-right">אומדן התקשרות</Label>
          <Input
            id="estimatedAmount"
            type="number"
            value={formData.estimatedAmount || ''}
            onChange={(e) => handleChange('estimatedAmount', e.target.value ? Number(e.target.value) : undefined)}
            disabled={!canEdit}
            className="text-right"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency" className="text-sm font-medium text-right">מטבע</Label>
          <select
            value={formData.currency || ''}
            onChange={(e) => handleChange('currency', e.target.value || undefined)}
            disabled={!canEdit}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right"
          >
            <option value="">בחר מטבע</option>
            {Object.entries(CURRENCY_CONFIG).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 6: Planning Source and Complexity */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="planningSource" className="text-sm font-medium text-right">מקור תכנון *</Label>
          <select
            value={formData.planningSource}
            onChange={(e) => handleChange('planningSource', e.target.value)}
            disabled={!permissions.canEditPlanningSource}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right"
            required
          >
            {Object.entries(PLANNING_SOURCE_CONFIG).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="complexity" className="text-sm font-medium text-right">רמת מורכבות</Label>
          <select
            value={formData.complexity || ''}
            onChange={(e) => handleChange('complexity', e.target.value ? Number(e.target.value) : undefined)}
            disabled={!permissions.canEditComplexity}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right"
          >
            <option value="">בחר רמת מורכבות</option>
            <option value={1}>פשוט</option>
            <option value={2}>בינוני</option>
            <option value={3}>מורכב</option>
          </select>
        </div>
      </div>

      {/* Row 7: Officer and Team */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="assignedOfficerName" className="text-sm font-medium text-right">קניין</Label>
          {permissions.canEditOfficer ? (
            <Select
              value={formData.assignedOfficerName || ''}
              onValueChange={(value) => handleChange('assignedOfficerName', value)}
              disabled={!canEdit}
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="בחר קניין" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ללא קניין</SelectItem>
                {getAvailableOfficers().map(officer => (
                  <SelectItem key={officer.id} value={officer.fullName}>
                    {officer.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="assignedOfficerName"
              value={formData.assignedOfficerName || ''}
              disabled
              className="text-right bg-gray-50"
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="teamName" className="text-sm font-medium text-right">צוות</Label>
          {permissions.canEditTeam && user?.roleCode === 1 ? (
            <Select
              value={formData.teamName || ''}
              onValueChange={(value) => handleChange('teamName', value)}
              disabled={!canEdit}
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="בחר צוות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ללא צוות</SelectItem>
                {getAvailableTeams().map(team => (
                  <SelectItem key={team.id} value={team.name}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="teamName"
              value={formData.teamName || (user?.roleCode === 2 ? user.procurementTeam : '')}
              disabled
              className="text-right bg-gray-50"
            />
          )}
        </div>
      </div>

      {/* Row 8: Start Date */}
      <div className="space-y-2">
        <Label htmlFor="startDate" className="text-sm font-medium text-right">מועד נדרש להתנעה</Label>
        <Input
          id="startDate"
          type="date"
          value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
          onChange={(e) => handleChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
          disabled={!permissions.canEditStartDate}
          className="text-right"
        />
      </div>

      {/* Row 9: Status (only for authorized users) */}
      {permissions.canEditStatus && availableStatusOptions.length > 1 && (
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium text-right">סטטוס</Label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
            disabled={!canEdit}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right"
          >
            {availableStatusOptions.map(status => (
              <option key={status} value={status}>
                {STATUS_CONFIG[status as TaskStatus].label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Row 10: Planning Notes */}
      <div className="space-y-2">
        <Label htmlFor="planningNotes" className="text-sm font-medium text-right">הערות לתכנון</Label>
        <Textarea
          id="planningNotes"
          value={formData.planningNotes || ''}
          onChange={(e) => handleChange('planningNotes', e.target.value)}
          disabled={!permissions.canEditPlanningNotes}
          className="text-right min-h-[80px]"
          rows={3}
        />
      </div>

      {/* Row 11: Officer Notes */}
      <div className="space-y-2">
        <Label htmlFor="officerNotes" className="text-sm font-medium text-right">הערות טיפול קניין</Label>
        <Textarea
          id="officerNotes"
          value={formData.officerNotes || ''}
          onChange={(e) => handleChange('officerNotes', e.target.value)}
          disabled={!permissions.canEditOfficerNotes}
          className="text-right min-h-[80px]"
          rows={3}
        />
      </div>

      {/* Row 12: Suppliers */}
      <div className="space-y-2">
        <Label htmlFor="supplierList" className="text-sm font-medium text-right">ספקים פוטנציאליים</Label>
        <Textarea
          id="supplierList"
          value={formData.supplierList || ''}
          onChange={(e) => handleChange('supplierList', e.target.value)}
          disabled={!canEdit}
          className="text-right min-h-[80px]"
          rows={3}
        />
      </div>

      {/* Row 13: Justification */}
      <div className="space-y-2">
        <Label htmlFor="justification" className="text-sm font-medium text-right">הערות</Label>
        <Textarea
          id="justification"
          value={formData.justification || ''}
          onChange={(e) => handleChange('justification', e.target.value)}
          disabled={!canEdit}
          className="text-right min-h-[80px]"
          rows={3}
        />
      </div>
    </div>
  );
};

export default ProgramForm;