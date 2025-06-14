import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import WorkerFormDialog from '../../components/workers/WorkerFormDialog';
import WorkersTable from '../../components/workers/WorkersTable';
import { apiRequest } from '../../utils/api';

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

const WorkersManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [records, setRecords] = useState<WorkerRecord[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [procurementTeams, setProcurementTeams] = useState<ProcurementTeam[]>([]);
  const [organizationalRoles, setOrganizationalRoles] = useState<OrganizationalRole[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WorkerRecord | null>(null);
  const [formData, setFormData] = useState<Partial<WorkerRecord>>({});

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [workersRes, divisionsRes, departmentsRes, teamsRes, rolesRes] = await Promise.all([
        apiRequest.get('/workers'),
        apiRequest.get('/workers/divisions'),
        apiRequest.get('/workers/departments'),
        apiRequest.get('/workers/procurement-teams'),
        apiRequest.get('/workers/organizational-roles')
      ]);

      if (workersRes.ok) {
        const workersData = await workersRes.json();
        setRecords(workersData);
      }

      if (divisionsRes.ok) {
        const divisionsData = await divisionsRes.json();
        setDivisions(divisionsData);
      }

      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData);
      }

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setProcurementTeams(teamsData);
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setOrganizationalRoles(rolesData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת הנתונים",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
    if (!validateForm()) return;

    try {
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

      let response;
      if (editingRecord) {
        // Update existing worker
        response = await apiRequest.put(`/workers/${editingRecord.id}`, processedData);
      } else {
        // Create new worker
        response = await apiRequest.post('/workers', processedData);
      }

      if (response.ok) {
        const savedWorker = await response.json();
        
        if (editingRecord) {
          setRecords(prev => prev.map(record => 
            record.id === editingRecord.id ? savedWorker : record
          ));
          toast({
            title: "הצלחה",
            description: "הרשומה עודכנה בהצלחה"
          });
        } else {
          setRecords(prev => [...prev, savedWorker]);
          toast({
            title: "הצלחה",
            description: "הרשומה נוספה בהצלחה"
          });
        }

        setIsAddDialogOpen(false);
        setEditingRecord(null);
        setFormData({});
      } else {
        const errorData = await response.json();
        toast({
          title: "שגיאה",
          description: errorData.error || "שגיאה בשמירת הנתונים",
          variant: "destructive"
        });
      }
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
        const response = await apiRequest.delete(`/workers/${id}`);
        
        if (response.ok) {
          setRecords(prev => prev.filter(record => record.id !== id));
          toast({
            title: "הצלחה",
            description: "הרשומה נמחקה בהצלחה"
          });
        } else {
          const errorData = await response.json();
          toast({
            title: "שגיאה",
            description: errorData.error || "שגיאה במחיקת הרשומה",
            variant: "destructive"
          });
        }
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
                  <p className="text-gray-600 mt-1">ניהול רשימת העובדים ומשתמשי המערכת</p>
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