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

const ProgramForm: React.FC<ProgramFormProps> = ({ program, canEdit, onProgramUpdate }) => {
  const [formData, setFormData] = useState(program);
  const { user } = useAuth();

  const handleChange = (field: keyof Program, value: any) => {
    const updatedProgram = { ...formData, [field]: value, lastUpdate: new Date() };
    setFormData(updatedProgram);
    onProgramUpdate(updatedProgram);
  };

  // Check field-specific permissions
  const canEditField = (field: string) => {
    if (!canEdit) return false;

    const userRole = user?.roleCode;
    const status = program.status;

    switch (field) {
      case 'planningSource':
      case 'domainName':
      case 'teamName':
      case 'planningNotes':
        // Only procurement manager can edit these
        return userRole === 1;

      case 'complexity':
        // Special rules for complexity
        if (userRole !== 1) return false;
        if (status === 'Open') return true; // Can save empty in Open status
        if (status === 'Plan') return true; // Can change but not leave empty
        return false; // Cannot edit in other statuses

      case 'assignedOfficerName':
        // Assignment permissions
        const assignPermissions = 'Manager only'; // This should come from system settings
        if (assignPermissions === 'Manager only') {
          return userRole === 1;
        } else if (assignPermissions === 'Team leader') {
          return userRole === 1 || userRole === 2;
        }
        return false;

      case 'startDate':
        // Start date rules
        if (userRole !== 1) return false;
        if (status === 'Open') return true; // Can save empty in Open status
        if (status === 'Plan') return true; // Can change but not leave empty
        return false; // Cannot edit in other statuses

      case 'officerNotes':
        // Officer notes can be edited by procurement manager, officer, and team leader
        return userRole === 1 || userRole === 2 || userRole === 3;

      case 'status':
        // Status changes are handled separately based on complex rules
        return false; // Handled by separate status change logic

      default:
        return false;
    }
  };

  const canEditStatus = () => {
    const userRole = user?.roleCode;
    const status = program.status;

    // Only procurement manager can manually change status in most cases
    if (userRole === 1) {
      return true; // Procurement manager can change status based on rules in documentation
    }

    // Team leader can change Complete to Done if has permission
    if (userRole === 2 && status === 'Complete') {
      const closePermissions = 'Team Leader'; // This should come from system settings
      return closePermissions === 'Team Leader';
    }

    return false;
  };

  const getAvailableStatuses = () => {
    const userRole = user?.roleCode;
    const currentStatus = program.status;

    if (userRole === 1) { // Procurement manager
      switch (currentStatus) {
        case 'Complete':
          return ['Complete', 'Done', 'Freeze', 'Cancel'];
        case 'In Progress':
          return ['In Progress', 'Freeze', 'Cancel'];
        case 'Plan':
          return ['Plan', 'Freeze', 'Cancel'];
        case 'Open':
          return ['Open', 'Freeze', 'Cancel'];
        case 'Freeze':
          // Complex rules for unfreezing based on task state
          return ['Freeze', 'Cancel', 'Open', 'Plan', 'In Progress', 'Done', 'Complete'];
        default:
          return [currentStatus];
      }
    } else if (userRole === 2 && currentStatus === 'Complete') { // Team leader
      const closePermissions = 'Team Leader'; // This should come from system settings
      if (closePermissions === 'Team Leader') {
        return ['Complete', 'Done'];
      }
    }

    return [currentStatus]; // No changes allowed
  };

  return (
    <div className="space-y-3">
      {/* Form Fields */}
      <div className="space-y-3">
        {/* Title */}
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="program-title" className="text-sm font-medium text-right">כותרת המשימה *</Label>
          <Input
            id="program-title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            disabled={!canEdit}
            className="text-right text-sm h-8"
            maxLength={25}
            required
          />
        </div>

        {/* Description */}
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="program-description" className="text-sm font-medium text-right">פירוט המשימה</Label>
          <Textarea
            id="program-description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={!canEdit}
            className="text-right text-sm min-h-[4rem]"
            rows={3}
          />
        </div>

        {/* Work Year and Quarter in same row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="program-workYear" className="text-sm font-medium text-right">שנת עבודה *</Label>
            <Input
              id="program-workYear"
              type="number"
              value={formData.workYear}
              onChange={(e) => handleChange('workYear', Number(e.target.value))}
              disabled={!canEdit}
              className="text-right text-sm h-8"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="program-requiredQuarter" className="text-sm font-medium text-right">רבעון נדרש *</Label>
            <Input
              id="program-requiredQuarter"
              type="date"
              value={formData.requiredQuarter ? formData.requiredQuarter.toISOString().split('T')[0] : ''}
              onChange={(e) => handleChange('requiredQuarter', e.target.value ? new Date(e.target.value) : new Date())}
              disabled={!canEdit}
              className="text-sm h-8"
              required
            />
          </div>
        </div>

        {/* Requester and Division in same row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="program-requesterName" className="text-sm font-medium text-right">גורם דורש *</Label>
            <Input
              id="program-requesterName"
              value={formData.requesterName}
              onChange={(e) => handleChange('requesterName', e.target.value)}
              disabled={!canEdit}
              className="text-right text-sm h-8"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="program-divisionName" className="text-sm font-medium text-right">אגף *</Label>
            <Input
              id="program-divisionName"
              value={formData.divisionName}
              onChange={(e) => handleChange('divisionName', e.target.value)}
              disabled={!canEdit}
              className="text-right text-sm h-8"
              required
            />
          </div>
        </div>

        {/* Department and Domain in same row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="program-departmentName" className="text-sm font-medium text-right">מחלקה</Label>
            <Input
              id="program-departmentName"
              value={formData.departmentName || ''}
              onChange={(e) => handleChange('departmentName', e.target.value)}
              disabled={!canEdit}
              className="text-right text-sm h-8"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="program-domainName" className="text-sm font-medium text-right">תחום רכש</Label>
            <Input
              id="program-domainName"
              value={formData.domainName || ''}
              onChange={(e) => handleChange('domainName', e.target.value)}
              disabled={!canEditField('domainName')}
              className="text-right text-sm h-8"
            />
          </div>
        </div>

        {/* Amount and Currency in same row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="program-estimatedAmount" className="text-sm font-medium text-right">אומדן התקשרות</Label>
            <Input
              id="program-estimatedAmount"
              type="number"
              value={formData.estimatedAmount || ''}
              onChange={(e) => handleChange('estimatedAmount', e.target.value ? Number(e.target.value) : undefined)}
              disabled={!canEdit}
              className="text-right text-sm h-8"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="program-currency" className="text-sm font-medium text-right">מטבע</Label>
            <Select
              value={formData.currency || ''}
              onValueChange={(value) => handleChange('currency', value || undefined)}
              disabled={!canEdit}
            >
              <SelectTrigger id="program-currency" className="h-8 text-sm">
                <SelectValue placeholder="בחר מטבע" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">בחר מטבע</SelectItem>
                {Object.entries(CURRENCY_CONFIG).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Planning Source and Complexity in same row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="program-planningSource" className="text-sm font-medium text-right">מקור תכנון *</Label>
            <Select
              value={formData.planningSource}
              onValueChange={(value) => handleChange('planningSource', value)}
              disabled={!canEditField('planningSource')}
            >
              <SelectTrigger id="program-planningSource" className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLANNING_SOURCE_CONFIG).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="program-complexity" className="text-sm font-medium text-right">רמת מורכבות</Label>
            <Select
              value={formData.complexity?.toString() || ''}
              onValueChange={(value) => handleChange('complexity', value ? Number(value) : undefined)}
              disabled={!canEditField('complexity')}
            >
              <SelectTrigger id="program-complexity" className="h-8 text-sm">
                <SelectValue placeholder="בחר רמת מורכבות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">בחר רמת מורכבות</SelectItem>
                <SelectItem value="1">פשוט</SelectItem>
                <SelectItem value="2">בינוני</SelectItem>
                <SelectItem value="3">מורכב</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Officer and Team Assignment */}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="program-assignedOfficerName" className="text-sm font-medium text-right">קניין</Label>
            <Input
              id="program-assignedOfficerName"
              value={formData.assignedOfficerName || ''}
              onChange={(e) => handleChange('assignedOfficerName', e.target.value)}
              disabled={!canEditField('assignedOfficerName')}
              className="text-right text-sm h-8"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="program-teamName" className="text-sm font-medium text-right">צוות</Label>
            <Input
              id="program-teamName"
              value={formData.teamName || ''}
              onChange={(e) => handleChange('teamName', e.target.value)}
              disabled={!canEditField('teamName')}
              className="text-right text-sm h-8"
            />
          </div>
        </div>

        {/* Start Date */}
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="program-startDate" className="text-sm font-medium text-right">מועד נדרש להתנעה</Label>
          <Input
            id="program-startDate"
            type="date"
            value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
            disabled={!canEditField('startDate')}
            className="text-sm h-8"
          />
        </div>

        {/* Status (only for authorized users) */}
        {canEditStatus() && (
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="program-status" className="text-sm font-medium text-right">סטטוס</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange('status', value as TaskStatus)}
              disabled={!canEdit}
            >
              <SelectTrigger id="program-status" className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAvailableStatuses().map(status => (
                  <SelectItem key={status} value={status}>
                    {STATUS_CONFIG[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Notes */}
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="program-planningNotes" className="text-sm font-medium text-right">הערות לתכנון</Label>
          <Textarea
            id="program-planningNotes"
            value={formData.planningNotes || ''}
            onChange={(e) => handleChange('planningNotes', e.target.value)}
            disabled={!canEditField('planningNotes')}
            className="text-right text-sm min-h-[3rem]"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="program-officerNotes" className="text-sm font-medium text-right">הערות טיפול קניין</Label>
          <Textarea
            id="program-officerNotes"
            value={formData.officerNotes || ''}
            onChange={(e) => handleChange('officerNotes', e.target.value)}
            disabled={!canEditField('officerNotes')}
            className="text-right text-sm min-h-[3rem]"
            rows={2}
          />
        </div>

        {/* Last Update - Read Only */}
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="program-lastUpdate" className="text-sm font-medium text-right">עדכון אחרון למשימה</Label>
          <Input
            id="program-lastUpdate"
            value={formData.lastUpdate ? formData.lastUpdate.toLocaleDateString('he-IL') : ''}
            disabled
            className="text-right text-sm h-8 bg-gray-100"
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default ProgramForm;