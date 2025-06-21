import React, { useState } from 'react';
import { Program, TaskStatus, STATUS_CONFIG, PLANNING_SOURCE_CONFIG, CURRENCY_CONFIG, currentUser } from '../../types';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

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

  const handleChange = (field: keyof Program, value: any) => {
    const updatedProgram = { ...formData, [field]: value, lastUpdate: new Date() };
    setFormData(updatedProgram);
    onProgramUpdate(updatedProgram);
  };

  const canEditStatus = currentUser.role === 'procurement_manager' || currentUser.role === 'team_leader';
  const availableStatuses: TaskStatus[] = ['Open', 'Plan', 'In Progress', 'Complete', 'Done', 'Freeze', 'Cancel'];

  return (
    <div className="space-y-3">
      {/* Form Fields */}
      <div className="space-y-3">
        {/* Title */}
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

        {/* Description */}
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

        {/* Work Year and Quarter in same row */}
        <div className="grid grid-cols-2 gap-3">
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
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="requiredQuarter" className="text-sm font-medium text-right">רבעון נדרש *</Label>
            <Input
              id="requiredQuarter"
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
            <Label htmlFor="requesterName" className="text-sm font-medium text-right">גורם דורש *</Label>
            <Input
              id="requesterName"
              value={formData.requesterName}
              onChange={(e) => handleChange('requesterName', e.target.value)}
              disabled={!canEdit}
              className="text-right text-sm h-8"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="divisionName" className="text-sm font-medium text-right">אגף *</Label>
            <Input
              id="divisionName"
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
            <Label htmlFor="departmentName" className="text-sm font-medium text-right">מחלקה</Label>
            <Input
              id="departmentName"
              value={formData.departmentName || ''}
              onChange={(e) => handleChange('departmentName', e.target.value)}
              disabled={!canEdit}
              className="text-right text-sm h-8"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="domainName" className="text-sm font-medium text-right">תחום רכש</Label>
            <Input
              id="domainName"
              value={formData.domainName || ''}
              onChange={(e) => handleChange('domainName', e.target.value)}
              disabled={!canEdit}
              className="text-right text-sm h-8"
            />
          </div>
        </div>

        {/* Amount and Currency in same row */}
        <div className="grid grid-cols-2 gap-3">
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
            <select
              value={formData.currency || ''}
              onChange={(e) => handleChange('currency', e.target.value || undefined)}
              disabled={!canEdit}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">בחר מטבע</option>
              {Object.entries(CURRENCY_CONFIG).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Planning Source and Complexity in same row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="planningSource" className="text-sm font-medium text-right">מקור תכנון *</Label>
            <select
              value={formData.planningSource}
              onChange={(e) => handleChange('planningSource', e.target.value)}
              disabled={!canEdit}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              required
            >
              {Object.entries(PLANNING_SOURCE_CONFIG).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="complexity" className="text-sm font-medium text-right">רמת מורכבות</Label>
            <select
              value={formData.complexity || ''}
              onChange={(e) => handleChange('complexity', e.target.value ? Number(e.target.value) : undefined)}
              disabled={!canEdit}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">בחר רמת מורכבות</option>
              <option value={1}>פשוט</option>
              <option value={2}>בינוני</option>
              <option value={3}>מורכב</option>
            </select>
          </div>
        </div>

        {/* Status (only for authorized users) */}
        {canEditStatus && (
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="status" className="text-sm font-medium text-right">סטטוס</Label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
              disabled={!canEdit}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              {availableStatuses.map(status => (
                <option key={status} value={status}>
                  {STATUS_CONFIG[status].label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notes */}
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="planningNotes" className="text-sm font-medium text-right">הערות לתכנון</Label>
          <Textarea
            id="planningNotes"
            value={formData.planningNotes || ''}
            onChange={(e) => handleChange('planningNotes', e.target.value)}
            disabled={!canEdit}
            className="text-right text-sm min-h-[3rem]"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="officerNotes" className="text-sm font-medium text-right">הערות טיפול קניין</Label>
          <Textarea
            id="officerNotes"
            value={formData.officerNotes || ''}
            onChange={(e) => handleChange('officerNotes', e.target.value)}
            disabled={!canEdit}
            className="text-right text-sm min-h-[3rem]"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgramForm;