
import React, { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import WorkerFormDialog from '../../components/workers/WorkerFormDialog';
import WorkersTable from '../../components/workers/WorkersTable';

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

interface OrganizationalRole {
  id: number;
  roleCode: number;
  description: string;
  permissions?: string;
}

const WorkersManagement: React.FC = () => {
  console.log('WorkersManagement component rendering...');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock data
  const divisions = [
    { id: 1, name: 'אגף תפעול' },
    { id: 2, name: 'אגף שיווק' },
    { id: 3, name: 'לקוח חיצוני א' }
  ];
  
  const departments = [
    { id: 1, name: 'מחלקת הנדסה', divisionId: 1 },
    { id: 2, name: 'מחלקת איכות', divisionId: 1 },
    { id: 3, name: 'מחלקת שירות לקוחות', divisionId: 2 }
  ];

  const procurementTeams = [
    { id: 1, name: 'צוות רכש א' },
    { id: 2, name: 'צוות רכש ב' },
    { id: 3, name: 'צוות רכש מיוחד' }
  ];

  const organizationalRoles: OrganizationalRole[] = [
    {
      id: 1,
      roleCode: 1,
      description: 'מנהל רכש',
      permissions: 'הרשאות מלאות לניהול כל תהליכי הרכש'
    },
    {
      id: 2,
      roleCode: 2,
      description: 'ראש צוות',
      permissions: 'ניהול צוות קניינים ומעקב משימות'
    },
    {
      id: 3,
      roleCode: 3,
      description: 'קניין',
      permissions: 'ביצוע פעילויות רכש ומעקב משימות'
    },
    {
      id: 4,
      roleCode: 4,
      description: 'גורם דורש',
      permissions: 'הגשת בקשות רכש ומעקב אחר סטטוס'
    },
    {
      id: 5,
      roleCode: 5,
      description: 'מנהלן מערכת',
      permissions: 'ניהול הגדרות מערכת וטבלאות עזר'
    },
    {
      id: 6,
      roleCode: 9,
      description: 'גורם טכני',
      permissions: 'תחזוקת תשתיות המערכת'
    }
  ];

  const [records, setRecords] = useState<WorkerRecord[]>([
    { 
      id: 1, 
      employeeId: '1001',
      roleCode: 1,
      fullName: 'אבי כהן', 
      roleDescription: 'מנהל רכש', 
      password: '123456',
      email: 'avi@company.com'
    },
    { 
      id: 2, 
      employeeId: '1002',
      roleCode: 2,
      fullName: 'שרה לוי', 
      roleDescription: 'קניין בכיר', 
      password: '123456',
      procurementTeam: 'צוות רכש א',
      availableWorkDays: '20'
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WorkerRecord | null>(null);
  const [formData, setFormData] = useState<Partial<WorkerRecord>>({});

  const initializeForm = (record?: WorkerRecord) => {
    if (record) {
      setFormData(record);
    } else {
      setFormData({
        employeeId: '',
        roleCode: 1,
        fullName: '',
        roleDescription: '',
        password: '',
        divisionId: undefined,
        departmentId: undefined,
        procurementTeam: '',
        availableWorkDays: '',
        email: ''
      });
    }
  };

  const handleAdd = () => {
    initializeForm();
    setEditingRecord(null);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (record: WorkerRecord) => {
    initializeForm(record);
    setEditingRecord(record);
    setIsAddDialogOpen(true);
  };

  const validateForm = () => {
    if (!formData.employeeId || formData.employeeId.length !== 4 || !/^\d{4}$/.test(formData.employeeId)) {
      toast({
        title: "שגיאה",
        description: "קוד עובד חייב להיות בן 4 ספרות בדיוק",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.roleCode || ![1, 2, 3, 4, 5, 9].includes(formData.roleCode)) {
      toast({
        title: "שגיאה",
        description: "נא לבחור תפקיד מהרשימה",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.fullName) {
      toast({
        title: "שגיאה",
        description: "שם מלא ה וא שדה חובה",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.password || formData.password.length !== 6) {
      toast({
        title: "שגיאה",
        description: "סיסמה חייבת להיות בת 6 תווים בדיוק",
        variant: "destructive"
      });
      return false;
    }

    const existingRecord = records.find(r => 
      r.employeeId === formData.employeeId && r.id !== editingRecord?.id
    );
    if (existingRecord) {
      toast({
        title: "שגיאה",
        description: "קוד עובד כבר קיים במערכת",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const processedData = { ...formData };
    
    if (formData.roleCode !== 4 && formData.roleCode !== 5) {
      processedData.divisionId = undefined;
      processedData.departmentId = undefined;
    }
    
    if (formData.roleCode !== 2 && formData.roleCode !== 3) {
      processedData.procurementTeam = '';
    }
    
    if (formData.roleCode !== 2 && formData.roleCode !== 3) {
      processedData.availableWorkDays = '';
    }

    if (editingRecord) {
      setRecords(prev => prev.map(record => 
        record.id === editingRecord.id ? { ...record, ...processedData } : record
      ));
      toast({
        title: "הצלחה",
        description: "הרשומה עודכנה בהצלחה"
      });
    } else {
      const id = Math.max(...records.map(r => r.id), 0) + 1;
      setRecords(prev => [...prev, { ...processedData, id } as WorkerRecord]);
      toast({
        title: "הצלחה",
        description: "הרשומה נוספה בהצלחה"
      });
    }

    setIsAddDialogOpen(false);
    setEditingRecord(null);
    setFormData({});
  };

  const handleDelete = (id: number) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) {
      setRecords(prev => prev.filter(record => record.id !== id));
      toast({
        title: "הצלחה",
        description: "הרשומה נמחקה בהצלחה"
      });
    }
  };

  const handleInputChange = (key: keyof WorkerRecord, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Transform records for display
  const displayRecords = records.map(record => {
    const division = divisions.find(div => div.id === record.divisionId);
    const department = departments.find(dept => dept.id === record.departmentId);
    
    return {
      ...record,
      divisionName: division ? division.name : '',
      departmentName: department ? department.name : ''
    };
  });

  console.log('About to render WorkersManagement layout...');

  return (
    <AppLayout currentRoute="/system-settings">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/system-settings')}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה להגדרות מערכת
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 text-right">
              ניהול עובדים
            </h1>
          </div>
          
          <Card>
            <CardHeader className="text-right">
              <div className="flex justify-between items-center">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAdd}>
                      <Plus className="w-4 h-4 ml-2" />
                      הוספת עובד חדש
                    </Button>
                  </DialogTrigger>
                  <WorkerFormDialog
                    isOpen={isAddDialogOpen}
                    onClose={() => setIsAddDialogOpen(false)}
                    onSave={handleSave}
                    editingRecord={editingRecord}
                    formData={formData}
                    onInputChange={handleInputChange}
                    divisions={divisions}
                    departments={departments}
                    procurementTeams={procurementTeams}
                    organizationalRoles={organizationalRoles}
                  />
                </Dialog>
                <div>
                  <CardTitle className="text-xl">Workers</CardTitle>
                  <p className="text-gray-600 mt-1">ניהול רשימת העובדים ומשתמשי המערכת</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <WorkersTable
                records={displayRecords}
                onEdit={handleEdit}
                onDelete={handleDelete}
                divisions={divisions}
                departments={departments}
                procurementTeams={procurementTeams}
                organizationalRoles={organizationalRoles}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkersManagement;
