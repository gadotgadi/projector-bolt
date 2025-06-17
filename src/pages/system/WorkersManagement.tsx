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
import { mockUsers } from '../../data/mockUsers';

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

interface OrganizationalRole {
  id: number;
  roleCode: number;
  description: string;
  permissions?: string;
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

// Mock data
const mockOrganizationalRoles: OrganizationalRole[] = [
  { id: 1, roleCode: 0, description: 'מנהלן מערכת', permissions: 'מלא' },
  { id: 2, roleCode: 1, description: 'מנהל רכש', permissions: 'ניהול רכש' },
  { id: 3, roleCode: 2, description: 'ראש צוות', permissions: 'ניהול צוות' },
  { id: 4, roleCode: 3, description: 'קניין', permissions: 'ביצוע רכש' },
  { id: 5, roleCode: 4, description: 'גורם דורש', permissions: 'הגשת דרישות' },
  { id: 6, roleCode: 5, description: 'מנהל יחידה', permissions: 'ניהול יחידה' },
  { id: 7, roleCode: 6, description: 'חברי הנהלה וגורם מטה ארגוני', permissions: 'צפייה' },
  { id: 8, roleCode: 9, description: 'גורם טכני', permissions: 'תחזוקה טכנית' }
];

const mockDivisions: Division[] = [
  { id: 1, name: 'לוגיסטיקה' },
  { id: 2, name: 'טכנולוגיה' },
  { id: 3, name: 'מחקר ופיתוח' },
  { id: 4, name: 'משאבי אנוש' }
];

const mockDepartments: Department[] = [
  { id: 1, name: 'רכש וחוזים', divisionId: 1 },
  { id: 2, name: 'תפעול ותחזוקה', divisionId: 1 },
  { id: 3, name: 'מערכות מידע', divisionId: 2 },
  { id: 4, name: 'פיתוח תוכנה', divisionId: 2 }
];

const mockProcurementTeams: ProcurementTeam[] = [
  { id: 1, name: 'יעודי' },
  { id: 2, name: 'טכנולוגי' },
  { id: 3, name: 'לוגיסטי' },
  { id: 4, name: 'מחשוב' },
  { id: 5, name: 'הנדסי' },
  { id: 6, name: 'ביטחוני' }
];

// Convert mock users to worker records
const mockWorkersData: WorkerRecord[] = mockUsers.map(user => ({
  id: user.id,
  employeeId: user.employeeId,
  roleCode: user.roleCode,
  fullName: user.fullName,
  roleDescription: user.roleDescription,
  divisionId: undefined,
  departmentId: undefined,
  procurementTeam: user.procurementTeam || '',
  password: '******', // Never show actual password
  availableWorkDays: '200',
  email: user.email,
  divisionName: undefined,
  departmentName: undefined
}));

const WorkersManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [records, setRecords] = useState<WorkerRecord[]>(mockWorkersData);
  const [divisions] = useState<Division[]>(mockDivisions);
  const [departments] = useState<Department[]>(mockDepartments);
  const [procurementTeams] = useState<ProcurementTeam[]>(mockProcurementTeams);
  const [organizationalRoles] = useState<OrganizationalRole[]>(mockOrganizationalRoles);
  const [loading, setLoading] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WorkerRecord | null>(null);
  const [formData, setFormData] = useState<Partial<WorkerRecord>>({});

  const initializeForm = (record?: WorkerRecord) => {
    if (record) {
      setFormData(record);
    } else {
      setFormData({
        employeeId: '',
        roleCode: undefined,
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
    console.log('Opening add dialog with organizational roles:', organizationalRoles);
    initializeForm();
    setEditingRecord(null);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (record: WorkerRecord) => {
    console.log('Opening edit dialog for record:', record);
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

    if (!formData.roleCode || ![0, 1, 2, 3, 4, 5, 9].includes(formData.roleCode)) {
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
        description: "שם מלא הוא שדה חובה",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.password || (formData.password !== '******' && formData.password.length !== 6)) {
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

  const handleSave = async () => {
    console.log('Saving worker with form data:', formData);
    
    if (!validateForm()) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const processedData = { ...formData };
      
      // Clear irrelevant fields based on role
      if (formData.roleCode !== 4 && formData.roleCode !== 5) {
        processedData.divisionId = undefined;
        processedData.departmentId = undefined;
      }
      
      if (formData.roleCode !== 2 && formData.roleCode !== 3) {
        processedData.procurementTeam = '';
        processedData.availableWorkDays = '';
      }

      console.log('Processed data for mock save:', processedData);

      if (editingRecord) {
        // Update existing worker
        const updatedWorker = {
          ...editingRecord,
          ...processedData,
          password: formData.password === '******' ? editingRecord.password : formData.password
        } as WorkerRecord;
        
        setRecords(prev => prev.map(record => 
          record.id === editingRecord.id ? updatedWorker : record
        ));
        
        toast({
          title: "הצלחה",
          description: "הרשומה עודכנה בהצלחה"
        });
      } else {
        // Create new worker
        const newWorker = {
          id: Math.max(...records.map(r => r.id)) + 1,
          ...processedData,
          password: '******' // Don't store actual password in mock
        } as WorkerRecord;
        
        setRecords(prev => [...prev, newWorker]);
        
        toast({
          title: "הצלחה",
          description: "הרשומה נוספה בהצלחה"
        });
        
        // Redirect to home page after adding user
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }

      setIsAddDialogOpen(false);
      setEditingRecord(null);
      setFormData({});
    } catch (error) {
      console.error('Error saving worker:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בשמירת הנתונים",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setRecords(prev => prev.filter(record => record.id !== id));
        toast({
          title: "הצלחה",
          description: "הרשומה נמחקה בהצלחה"
        });
      } catch (error) {
        console.error('Error deleting worker:', error);
        toast({
          title: "שגיאה",
          description: "שגיאה במחיקת הרשומה",
          variant: "destructive"
        });
      }
    }
  };

  const handleInputChange = (key: keyof WorkerRecord, value: any) => {
    console.log('Form input changed:', key, value);
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <AppLayout currentRoute="/system-settings">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">טוען נתונים...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

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
                  <p className="text-gray-600 mt-1">ניהול רשימת העובדים ומשתמשי המערכת (מצב הדגמה)</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <WorkersTable
                records={records}
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