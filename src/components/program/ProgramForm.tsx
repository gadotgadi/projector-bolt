import React, { useState } from 'react';
import { Program, TaskStatus, STATUS_CONFIG, PLANNING_SOURCE_CONFIG, CURRENCY_CONFIG } from '../../types';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../auth/AuthProvider';

interface ProgramFormProps {
  program: Program;
  canEdit: boolean;
  onProgramUpdate: (program: Program) => void;
  isEditing?: boolean;
  onSave?: (updatedProgram: Program) => void;
  onCancel?: () => void;
}

// Mock data for dropdowns
const mockDivisions = [
  { id: 1, name: 'לוגיסטיקה' },
  { id: 2, name: 'טכנולוגיה' },
  { id: 3, name: 'מחקר ופיתוח' },
  { id: 4, name: 'משאבי אנוש' },
  { id: 5, name: 'מכירות' },
  { id: 6, name: 'תפעול' }
];

const mockDepartments = [
  { id: 1, name: 'רכש וחוזים', divisionId: 1 },
  { id: 2, name: 'תפעול ותחזוקה', divisionId: 1 },
  { id: 3, name: 'מערכות מידע', divisionId: 2 },
  { id: 4, name: 'פיתוח תוכנה', divisionId: 2 },
  { id: 5, name: 'מחקר', divisionId: 3 },
  { id: 6, name: 'פיתוח', divisionId: 3 },
  { id: 7, name: 'גיוס', divisionId: 4 },
  { id: 8, name: 'שכר', divisionId: 4 }
];

const mockDomains = [
  { id: 1, description: 'רכש לוגיסטי' },
  { id: 2, description: 'רכש טכנולוגי' },
  { id: 3, description: 'שירותים מקצועיים' },
  { id: 4, description: 'תחזוקה ותפעול' },
  { id: 5, description: 'ציוד משרדי' },
  { id: 6, description: 'תוכנה ומערכות' }
];

const mockRequesters = [
  { id: 5, fullName: 'רחל אברהם', divisionId: 4, departmentId: 7 },
  { id: 6, fullName: 'יוסי לוי', divisionId: 3, departmentId: 5 },
  { id: 7, fullName: 'מירי דוד', divisionId: 2, departmentId: 3 },
  { id: 8, fullName: 'דני רוזן', divisionId: 1, departmentId: 1 }
];

const mockOfficers = [
  { id: 3, fullName: 'שרה לוי', roleCode: 2, procurementTeam: 'צוות טכנולוגי' },
  { id: 4, fullName: 'אבי כהן', roleCode: 3, procurementTeam: 'צוות לוגיסטי' },
  { id: 9, fullName: 'דן ישראל', roleCode: 3, procurementTeam: 'צוות טכנולוגי' },
  { id: 10, fullName: 'מיכל רון', roleCode: 3, procurementTeam: 'צוות לוגיסטי' }
];

const mockTeams = [
  { id: 1, name: 'צוות טכנולוגי' },
  { id: 2, name: 'צוות לוגיסטי' },
  { id: 3, name: 'צוות ביטחוני' },
  { id: 4, name: 'צוות מחשוב' }
];

// Generate quarter options
const generateQuarterOptions = () => {
  const options = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year <= currentYear + 2; year++) {
    for (let q = 1; q <= 4; q++) {
      const shortYear = year.toString().slice(-2);
      options.push(`Q${q}/${shortYear}`);
    }
  }
  return options;
};

const ProgramForm: React.FC<ProgramFormProps> = ({ program, canEdit, onProgramUpdate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(program);

  const handleChange = (field: keyof Program, value: any) => {
    const updatedProgram = { ...formData, [field]: value, lastUpdate: new Date() };
    setFormData(updatedProgram);
    onProgramUpdate(updatedProgram);
  };

  // Check if user can edit specific fields
  const canEditField = (field: string) => {
    if (!canEdit) return false;
    
    switch (field) {
      case 'planningSource':
      case 'domainName':
      case 'complexity':
      case 'teamName':
      case 'planningNotes':
        return user?.roleCode === 1; // Only procurement manager
      case 'assignedOfficerName':
        // Based on assign permissions
        return user?.roleCode === 1 || user?.roleCode === 2; // Manager or team leader
      case 'startDate':
        return user?.roleCode === 1 && ['Open', 'Plan'].includes(program.status);
      case 'officerNotes':
        return [1, 2, 3].includes(user?.roleCode || 0); // Manager, team leader, officer
      default:
        return user?.roleCode === 1; // Default to manager only
    }
  };

  // Get filtered officers based on user role
  const getAvailableOfficers = () => {
    if (user?.roleCode === 1) {
      // Procurement manager sees all officers
      return mockOfficers;
    } else if (user?.roleCode === 2) {
      // Team leader sees only officers from their team
      return mockOfficers.filter(officer => officer.procurementTeam === user.procurementTeam);
    }
    return [];
  };

  // Get available teams based on user role
  const getAvailableTeams = () => {
    if (user?.roleCode === 1) {
      // Procurement manager sees all teams
      return mockTeams;
    } else if (user?.roleCode === 2) {
      // Team leader sees only their team
      return mockTeams.filter(team => team.name === user.procurementTeam);
    }
    return [];
  };

  // Convert quarter date to Q format
  const formatQuarterForDisplay = (date: Date | null) => {
    if (!date) return '';
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    const year = date.getFullYear().toString().slice(-2);
    return `Q${quarter}/${year}`;
  };

  // Convert Q format back to date
  const parseQuarterToDate = (quarterStr: string) => {
    if (!quarterStr) return null;
    const [quarter, year] = quarterStr.split('/');
    const quarterNum = parseInt(quarter.replace('Q', ''));
    const fullYear = 2000 + parseInt(year);
    const month = (quarterNum - 1) * 3;
    return new Date(fullYear, month, 1);
  };

  return (
    <div className="space-y-4">
      {/* Title - Full width */}
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="title" className="text-sm font-medium text-right">כותרת המשימה *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          disabled={!canEdit}
          className="text-right text-sm h-8"
          maxLength={25}
          required
        />
      </div>

      {/* Description - Full width */}
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="description" className="text-sm font-medium text-right">פירוט המשימה</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          disabled={!canEdit}
          className="text-right text-sm min-h-[4rem]"
          rows={3}
        />
      </div>

      {/* Two columns layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Right Column */}
        <div className="space-y-4">
          {/* Requester */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="requesterName" className="text-sm font-medium text-right">גורם דורש *</Label>
            <Select
              value={formData.requesterId?.toString() || 'none'}
              onValueChange={(value) => {
                if (value === 'none') {
                  handleChange('requesterName', '');
                  handleChange('requesterId', undefined);
                } else {
                  const requester = mockRequesters.find(r => r.id.toString() === value);
                  if (requester) {
                    handleChange('requesterName', requester.fullName);
                    handleChange('requesterId', requester.id);
                  }
                }
              }}
              disabled={!canEdit}
            >
              <SelectTrigger className="text-right text-sm h-8">
                <SelectValue placeholder="בחר גורם דורש" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ללא גורם דורש</SelectItem>
                {mockRequesters.map(requester => (
                  <SelectItem key={requester.id} value={requester.id.toString()}>
                    {requester.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Division */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="divisionName" className="text-sm font-medium text-right">אגף *</Label>
            <Select
              value={formData.divisionId?.toString() || 'none'}
              onValueChange={(value) => {
                if (value === 'none') {
                  handleChange('divisionName', '');
                  handleChange('divisionId', undefined);
                } else {
                  const division = mockDivisions.find(d => d.id.toString() === value);
                  if (division) {
                    handleChange('divisionName', division.name);
                    handleChange('divisionId', division.id);
                  }
                }
              }}
              disabled={!canEdit}
            >
              <SelectTrigger className="text-right text-sm h-8">
                <SelectValue placeholder="בחר אגף" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ללא אגף</SelectItem>
                {mockDivisions.map(division => (
                  <SelectItem key={division.id} value={division.id.toString()}>
                    {division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="departmentName" className="text-sm font-medium text-right">מחלקה</Label>
            <Select
              value={formData.departmentId?.toString() || 'none'}
              onValueChange={(value) => {
                if (value === 'none') {
                  handleChange('departmentName', '');
                  handleChange('departmentId', undefined);
                } else {
                  const department = mockDepartments.find(d => d.id.toString() === value);
                  if (department) {
                    handleChange('departmentName', department.name);
                    handleChange('departmentId', department.id);
                  }
                }
              }}
              disabled={!canEdit}
            >
              <SelectTrigger className="text-right text-sm h-8">
                <SelectValue placeholder="בחר מחלקה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ללא מחלקה</SelectItem>
                {mockDepartments
                  .filter(dept => !formData.divisionId || dept.divisionId === formData.divisionId)
                  .map(department => (
                    <SelectItem key={department.id} value={department.id.toString()}>
                      {department.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Left Column */}
        <div className="space-y-4">
          {/* Planning Source */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="planningSource" className="text-sm font-medium text-right">מקור תכנון *</Label>
            <Select
              value={formData.planningSource}
              onValueChange={(value) => handleChange('planningSource', value)}
              disabled={!canEditField('planningSource')}
            >
              <SelectTrigger className="text-right text-sm h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLANNING_SOURCE_CONFIG).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Required Quarter */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="requiredQuarter" className="text-sm font-medium text-right">רבעון נדרש *</Label>
            <Select
              value={formatQuarterForDisplay(formData.requiredQuarter)}
              onValueChange={(value) => handleChange('requiredQuarter', parseQuarterToDate(value))}
              disabled={!canEdit}
            >
              <SelectTrigger className="text-right text-sm h-8">
                <SelectValue placeholder="בחר רבעון" />
              </SelectTrigger>
              <SelectContent>
                {generateQuarterOptions().map(quarter => (
                  <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Amount */}
          <div className="grid grid-cols-2 gap-2">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="estimatedAmount" className="text-sm font-medium text-right">אומדן התקשרות</Label>
              <Input
                id="estimatedAmount"
                type="number"
                value={formData.estimatedAmount || ''}
                onChange={(e) => handleChange('estimatedAmount', e.target.value ? Number(e.target.value) : undefined)}
                disabled={!canEdit}
                className="text-right text-sm h-8"
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="currency" className="text-sm font-medium text-right">מטבע</Label>
              <Select
                value={formData.currency || 'none'}
                onValueChange={(value) => handleChange('currency', value === 'none' ? undefined : value)}
                disabled={!canEdit}
              >
                <SelectTrigger className="text-right text-sm h-8">
                  <SelectValue placeholder="בחר מטבע" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ללא מטבע</SelectItem>
                  {Object.entries(CURRENCY_CONFIG).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers - Full width */}
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="supplierList" className="text-sm font-medium text-right">ספקים פוטנציאליים</Label>
        <Textarea
          id="supplierList"
          value={formData.supplierList || ''}
          onChange={(e) => handleChange('supplierList', e.target.value)}
          disabled={!canEdit}
          className="text-right text-sm min-h-[3rem]"
          rows={3}
        />
      </div>

      {/* Notes - Full width */}
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="justification" className="text-sm font-medium text-right">הערות</Label>
        <Textarea
          id="justification"
          value={formData.justification || ''}
          onChange={(e) => handleChange('justification', e.target.value)}
          disabled={!canEdit}
          className="text-right text-sm min-h-[3rem]"
          rows={3}
        />
      </div>

      {/* Gray separator */}
      <div className="border-t border-gray-300 my-4"></div>

      {/* Two columns layout - Second section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Right Column */}
        <div className="space-y-4">
          {/* Domain */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="domainName" className="text-sm font-medium text-right">תחום</Label>
            <Select
              value={formData.domainId?.toString() || 'none'}
              onValueChange={(value) => {
                if (value === 'none') {
                  handleChange('domainName', '');
                  handleChange('domainId', undefined);
                } else {
                  const domain = mockDomains.find(d => d.id.toString() === value);
                  if (domain) {
                    handleChange('domainName', domain.description);
                    handleChange('domainId', domain.id);
                  }
                }
              }}
              disabled={!canEditField('domainName')}
            >
              <SelectTrigger className="text-right text-sm h-8">
                <SelectValue placeholder="בחר תחום רכש" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ללא תחום</SelectItem>
                {mockDomains.map(domain => (
                  <SelectItem key={domain.id} value={domain.id.toString()}>
                    {domain.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Officer */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="assignedOfficerName" className="text-sm font-medium text-right">קניין</Label>
            <Select
              value={formData.assignedOfficerId?.toString() || 'none'}
              onValueChange={(value) => {
                if (value === 'none') {
                  handleChange('assignedOfficerName', '');
                  handleChange('assignedOfficerId', undefined);
                  handleChange('teamName', '');
                } else {
                  const officer = getAvailableOfficers().find(o => o.id.toString() === value);
                  if (officer) {
                    handleChange('assignedOfficerName', officer.fullName);
                    handleChange('assignedOfficerId', officer.id);
                    // Auto-fill computed team name
                    handleChange('teamName', officer.procurementTeam || '');
                  }
                }
              }}
              disabled={!canEditField('assignedOfficerName')}
            >
              <SelectTrigger className="text-right text-sm h-8">
                <SelectValue placeholder="בחר קניין" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ללא קניין</SelectItem>
                {getAvailableOfficers().map(officer => (
                  <SelectItem key={officer.id} value={officer.id.toString()}>
                    {officer.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="teamName" className="text-sm font-medium text-right">צוות</Label>
            <Input
              value={formData.teamName || ''}
              disabled
              className="text-right text-sm h-8 bg-gray-50"
              placeholder="נקבע אוטומטית לפי הקניין המטפל"
            />
          </div>
        </div>

        {/* Left Column */}
        <div className="space-y-4">
          {/* Complexity */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="complexity" className="text-sm font-medium text-right">רמת מורכבות</Label>
            <Select
              value={formData.complexity?.toString() || 'none'}
              onValueChange={(value) => handleChange('complexity', value === 'none' ? undefined : Number(value))}
              disabled={!canEditField('complexity')}
            >
              <SelectTrigger className="text-right text-sm h-8">
                <SelectValue placeholder="בחר רמת מורכבות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ללא רמת מורכבות</SelectItem>
                <SelectItem value="1">פשוט</SelectItem>
                <SelectItem value="2">בינוני</SelectItem>
                <SelectItem value="3">מורכב</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Work Year */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="workYear" className="text-sm font-medium text-right">שנת עבודה *</Label>
            <Input
              id="workYear"
              type="number"
              value={formData.workYear}
              onChange={(e) => handleChange('workYear', Number(e.target.value))}
              disabled={!canEdit}
              className="text-right text-sm h-8"
              required
            />
          </div>

          {/* Start Date */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="startDate" className="text-sm font-medium text-right">מועד נדרש להתנעה</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
              disabled={!canEditField('startDate')}
              className="text-right text-sm h-8"
            />
          </div>
        </div>
      </div>

      {/* Planning Notes - Full width */}
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="planningNotes" className="text-sm font-medium text-right">הערות תכנון</Label>
        <Textarea
          id="planningNotes"
          value={formData.planningNotes || ''}
          onChange={(e) => handleChange('planningNotes', e.target.value)}
          disabled={!canEditField('planningNotes')}
          className="text-right text-sm min-h-[3rem]"
          rows={3}
        />
      </div>

      {/* Officer Notes - Full width */}
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="officerNotes" className="text-sm font-medium text-right">הערות קניין</Label>
        <Textarea
          id="officerNotes"
          value={formData.officerNotes || ''}
          onChange={(e) => handleChange('officerNotes', e.target.value)}
          disabled={!canEditField('officerNotes')}
          className="text-right text-sm min-h-[3rem]"
          rows={3}
        />
      </div>
    </div>
  );
};

export default ProgramForm;