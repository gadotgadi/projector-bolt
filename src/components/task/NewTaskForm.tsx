import React, { useState } from 'react';
import { Program, TaskStatus, PLANNING_SOURCE_CONFIG, CURRENCY_CONFIG } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface NewTaskFormProps {
  onSave: (task: Omit<Program, 'taskId' | 'createdAt' | 'lastUpdate'>) => void;
  onCancel: () => void;
}

const NewTaskForm: React.FC<NewTaskFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    workYear: new Date().getFullYear(),
    requiredQuarter: new Date(),
    title: '',
    description: '',
    requesterId: 0,
    requesterName: '',
    divisionId: 0,
    divisionName: '',
    departmentId: undefined,
    departmentName: '',
    domainId: undefined,
    domainName: '',
    estimatedAmount: undefined,
    currency: undefined,
    supplierList: '',
    justification: '',
    planningSource: 'annual_planning' as const,
    complexity: undefined,
    engagementTypeId: undefined,
    engagementTypeName: '',
    status: 'Open' as TaskStatus,
    assignedOfficerId: undefined,
    assignedOfficerName: '',
    teamId: undefined,
    teamName: '',
    startDate: undefined,
    planningNotes: '',
    officerNotes: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuarterChange = (value: string) => {
    // Convert Q1/24 format to date for internal storage
    const [quarter, year] = value.split('/');
    const quarterNum = parseInt(quarter.replace('Q', ''));
    const fullYear = 2000 + parseInt(year);
    const month = (quarterNum - 1) * 3;
    const date = new Date(fullYear, month, 1);
    
    setFormData(prev => ({ 
      ...prev, 
      requiredQuarter: date,
      workYear: fullYear 
    }));
  };

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

  const getCurrentQuarter = () => {
    const currentDate = new Date();
    const quarter = Math.ceil((currentDate.getMonth() + 1) / 3);
    const year = currentDate.getFullYear().toString().slice(-2);
    return `Q${quarter}/${year}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.requesterName || !formData.divisionName) {
      alert('יש למלא את כל השדות החובה');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header Section with Actions */}
      <div className="border-b bg-gray-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">מספר משימה</Label>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
              יקבע אוטומטית עם השמירה
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="px-6">
            ביטול
          </Button>
          <Button type="submit" form="task-form" className="bg-green-600 hover:bg-green-700 px-6 text-white">
            שמור
          </Button>
        </div>
      </div>

      <form id="task-form" onSubmit={handleSubmit} className="p-6">
        {/* Basic Information */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">כותרת</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="text-right h-8 text-sm"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">פירוט</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="text-right h-8 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="requiredQuarter" className="block text-sm font-medium text-gray-700 mb-1">רבעון נדרש</Label>
              <select
                value={getCurrentQuarter()}
                onChange={(e) => handleQuarterChange(e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                required
              >
                {generateQuarterOptions().map(quarter => (
                  <option key={quarter} value={quarter}>{quarter}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="lastUpdate" className="block text-sm font-medium text-gray-700 mb-1">מועד עדכון אחרון</Label>
              <Input
                id="lastUpdate"
                value={`${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`}
                className="text-right h-8 text-sm bg-gray-50"
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="requesterName" className="block text-sm font-medium text-gray-700 mb-1">גורם דורש</Label>
              <Input
                id="requesterName"
                value={formData.requesterName}
                onChange={(e) => handleChange('requesterName', e.target.value)}
                className="text-right h-8 text-sm"
                required
              />
            </div>

            <div>
              <Label htmlFor="departmentName" className="block text-sm font-medium text-gray-700 mb-1">מחלקה</Label>
              <Input
                id="departmentName"
                value={formData.departmentName}
                onChange={(e) => handleChange('departmentName', e.target.value)}
                className="text-right h-8 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="divisionName" className="block text-sm font-medium text-gray-700 mb-1">אגף</Label>
              <Input
                id="divisionName"
                value={formData.divisionName}
                onChange={(e) => handleChange('divisionName', e.target.value)}
                className="text-right h-8 text-sm"
                required
              />
            </div>

            <div>
              <Label htmlFor="planningSource" className="block text-sm font-medium text-gray-700 mb-1">מקור תכנון</Label>
              <select
                value={formData.planningSource}
                onChange={(e) => handleChange('planningSource', e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                required
              >
                {Object.entries(PLANNING_SOURCE_CONFIG).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="estimatedAmount" className="block text-sm font-medium text-gray-700 mb-1">אומדן התקשרות</Label>
              <div className="flex gap-2">
                <Input
                  id="estimatedAmount"
                  type="number"
                  value={formData.estimatedAmount || ''}
                  onChange={(e) => handleChange('estimatedAmount', e.target.value ? Number(e.target.value) : undefined)}
                  className="text-right h-8 text-sm flex-1"
                />
                <select
                  value={formData.currency || ''}
                  onChange={(e) => handleChange('currency', e.target.value || undefined)}
                  className="flex h-8 w-20 rounded-md border border-input bg-background px-2 py-1 text-sm"
                >
                  <option value="">מטבע</option>
                  {Object.entries(CURRENCY_CONFIG).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-span-3">
              {/* Empty space for layout */}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplierList" className="block text-sm font-medium text-gray-700 mb-1">ספקים</Label>
              <Textarea
                id="supplierList"
                value={formData.supplierList}
                onChange={(e) => handleChange('supplierList', e.target.value)}
                className="text-right text-sm"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-1">נימוק</Label>
              <Textarea
                id="justification"
                value={formData.justification}
                onChange={(e) => handleChange('justification', e.target.value)}
                className="text-right text-sm"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* System Messages Section - at the bottom */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">
              הודעות מערכת יוצגו כאן (שגיאות או הודעות הצלחה)
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewTaskForm;
