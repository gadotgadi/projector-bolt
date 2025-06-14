
import React, { useState } from 'react';
import { Program, TaskStatus, STATUS_CONFIG, currentUser } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import StatusBadge from '../common/StatusBadge';

interface TaskFormProps {
  task: Program;
  isEditing: boolean;
  onSave: (task: Program) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, isEditing, onSave, onCancel }) => {
  const [formData, setFormData] = useState(task);

  const handleChange = (field: keyof Program, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, lastUpdate: new Date() });
  };

  const canEditStatus = currentUser.role === 'procurement_manager' || currentUser.role === 'team_leader';
  const availableStatuses: TaskStatus[] = ['Open', 'Plan', 'In Progress', 'Complete', 'Done', 'Freeze', 'Cancel'];

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">פרטי משימה #{task.taskId}</h2>
        <StatusBadge status={formData.status} size="lg" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <Label htmlFor="title">כותרת המשימה</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            disabled={!isEditing}
            className="text-right"
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">תיאור המשימה</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={!isEditing}
            className="text-right"
            rows={3}
          />
        </div>

        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="requesterName">שם הדורש</Label>
            <Input
              id="requesterName"
              value={formData.requesterName}
              onChange={(e) => handleChange('requesterName', e.target.value)}
              disabled={!isEditing}
              className="text-right"
            />
          </div>
          <div>
            <Label htmlFor="divisionName">אגף</Label>
            <Input
              id="divisionName"
              value={formData.divisionName}
              onChange={(e) => handleChange('divisionName', e.target.value)}
              disabled={!isEditing}
              className="text-right"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="domainName">תחום</Label>
            <Input
              id="domainName"
              value={formData.domainName || ''}
              onChange={(e) => handleChange('domainName', e.target.value)}
              disabled={!isEditing}
              className="text-right"
            />
          </div>
          <div>
            <Label htmlFor="complexity">רמת מורכבות</Label>
            <select
              value={formData.complexity || ''}
              onChange={(e) => handleChange('complexity', e.target.value ? Number(e.target.value) : undefined)}
              disabled={!isEditing}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">בחר רמת מורכבות</option>
              <option value={1}>פשוט</option>
              <option value={2}>בינוני</option>
              <option value={3}>מורכב</option>
            </select>
          </div>
        </div>

        {/* Status (only for authorized users) */}
        {canEditStatus && isEditing && (
          <div>
            <Label htmlFor="status">סטטוס</Label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {availableStatuses.map(status => (
                <option key={status} value={status}>
                  {STATUS_CONFIG[status].label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="requiredQuarter">רבעון נדרש</Label>
            <Input
              id="requiredQuarter"
              type="date"
              value={formData.requiredQuarter ? formData.requiredQuarter.toISOString().split('T')[0] : ''}
              onChange={(e) => handleChange('requiredQuarter', e.target.value ? new Date(e.target.value) : new Date())}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="workYear">שנת עבודה</Label>
            <Input
              id="workYear"
              type="number"
              value={formData.workYear}
              onChange={(e) => handleChange('workYear', Number(e.target.value))}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              שמור
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              ביטול
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default TaskForm;
