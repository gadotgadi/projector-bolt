import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface WorkerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingRecord: WorkerRecord | null;
  formData: Partial<WorkerRecord>;
  onInputChange: (key: keyof WorkerRecord, value: any) => void;
  divisions: Division[];
  departments: Department[];
  procurementTeams: ProcurementTeam[];
  organizationalRoles: OrganizationalRole[];
}

const WorkerFormDialog: React.FC<WorkerFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecord,
  formData,
  onInputChange,
  divisions,
  departments,
  procurementTeams,
  organizationalRoles
}) => {
  // Debug effect
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 Dialog opened with roles:', organizationalRoles);
    }
  }, [isOpen, organizationalRoles]);

  const isFieldRelevant = (field: string, roleCode?: number) => {
    if (!roleCode) return true;
    
    switch (field) {
      case 'divisionId':
      case 'departmentId':
        return roleCode === 4 || roleCode === 5;
      case 'procurementTeam':
        return roleCode === 2 || roleCode === 3;
      case 'availableWorkDays':
        return roleCode === 2 || roleCode === 3;
      default:
        return true;
    }
  };

  // Hardcoded roles as fallback
  const fallbackRoles = [
    { id: 1, roleCode: 0, description: 'מנהלן מערכת' },
    { id: 2, roleCode: 1, description: 'מנהל רכש' },
    { id: 3, roleCode: 2, description: 'ראש צוות' },
    { id: 4, roleCode: 3, description: 'קניין' },
    { id: 5, roleCode: 4, description: 'גורם דורש' },
    { id: 6, roleCode: 5, description: 'מנהלן מערכת' },
    { id: 7, roleCode: 9, description: 'גורם טכני' }
  ];

  const rolesToUse = organizationalRoles && organizationalRoles.length > 0 ? organizationalRoles : fallbackRoles;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-right">
          <DialogTitle>
            {editingRecord ? 'עריכת עובד' : 'הוספת עובד חדש'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4" dir="rtl">
          <div className="space-y-2">
            <Label htmlFor="roleCode" className="text-right">
              תפקיד <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.roleCode ? formData.roleCode.toString() : ''}
              onValueChange={(value) => {
                console.log('🔍 Role selected:', value);
                onInputChange('roleCode', value ? parseInt(value) : undefined);
              }}
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="בחר תפקיד" />
              </SelectTrigger>
              <SelectContent>
                {rolesToUse.map(role => (
                  <SelectItem key={role.roleCode} value={role.roleCode.toString()}>
                    {role.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-gray-500">
              {organizationalRoles && organizationalRoles.length > 0 
                ? `נטענו ${organizationalRoles.length} תפקידים מהשרת`
                : 'משתמש ברשימת תפקידים ברירת מחדל'
              }
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeId" className="text-right">
              קוד עובד (4 ספרות) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="employeeId"
              type="text"
              value={formData.employeeId || ''}
              onChange={(e) => onInputChange('employeeId', e.target.value)}
              className="text-right"
              placeholder="הכנס קוד עובד (1000-9999)"
              maxLength={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-right">
              שם מלא <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName || ''}
              onChange={(e) => onInputChange('fullName', e.target.value)}
              className="text-right"
              placeholder="הכנס שם מלא"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleDescription" className="text-right">
              תיאור תפקיד
            </Label>
            <Input
              id="roleDescription"
              type="text"
              value={formData.roleDescription || ''}
              onChange={(e) => onInputChange('roleDescription', e.target.value)}
              className="text-right"
              placeholder="הכנס תיאור תפקיד"
            />
          </div>

          {isFieldRelevant('divisionId', formData.roleCode) && (
            <div className="space-y-2">
              <Label htmlFor="divisionId" className="text-right">
                שייכות לאגף (רק לתפקידים 4,5)
              </Label>
              <Select
                value={formData.divisionId ? formData.divisionId.toString() : ''}
                onValueChange={(value) => onInputChange('divisionId', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר אגף" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ללא אגף</SelectItem>
                  {divisions.map(div => (
                    <SelectItem key={div.id} value={div.id.toString()}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isFieldRelevant('departmentId', formData.roleCode) && (
            <div className="space-y-2">
              <Label htmlFor="departmentId" className="text-right">
                שייכות למחלקה (רק לתפקידים 4,5)
              </Label>
              <Select
                value={formData.departmentId ? formData.departmentId.toString() : ''}
                onValueChange={(value) => onInputChange('departmentId', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר מחלקה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ללא מחלקה</SelectItem>
                  {departments
                    .filter(dept => !formData.divisionId || dept.divisionId === formData.divisionId)
                    .map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isFieldRelevant('procurementTeam', formData.roleCode) && (
            <div className="space-y-2">
              <Label htmlFor="procurementTeam" className="text-right">
                צוות רכש (רק לתפקידים 2,3)
              </Label>
              <Select
                value={formData.procurementTeam || ''}
                onValueChange={(value) => onInputChange('procurementTeam', value)}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר צוות רכש" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ללא צוות</SelectItem>
                  {procurementTeams.map(team => (
                    <SelectItem key={team.id} value={team.name}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-right">
              סיסמת כניסה למערכת (6 תווים) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="text"
              value={formData.password || ''}
              onChange={(e) => onInputChange('password', e.target.value)}
              className="text-right"
              placeholder={editingRecord ? "השאר ריק לשמירת הסיסמה הנוכחית" : "הכנס סיסמה (6 תווים)"}
              maxLength={6}
            />
          </div>

          {isFieldRelevant('availableWorkDays', formData.roleCode) && (
            <div className="space-y-2">
              <Label htmlFor="availableWorkDays" className="text-right">
                ימי עבודה זמינים (רק לתפקידים 2,3)
              </Label>
              <Input
                id="availableWorkDays"
                type="text"
                value={formData.availableWorkDays || ''}
                onChange={(e) => onInputChange('availableWorkDays', e.target.value)}
                className="text-right"
                placeholder="הכנס ימי עבודה זמינים"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-right">
              כתובת דואר אלקטרוני (רשות)
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => onInputChange('email', e.target.value)}
              className="text-right"
              placeholder="הכנס כתובת דואר אלקטרוני"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onSave} className="flex-1">
              שמירה
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkerFormDialog;