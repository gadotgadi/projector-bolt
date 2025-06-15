import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { apiRequest } from '../../utils/api';

interface DepartmentRecord {
  id: number;
  name: string;
  divisionId?: number;
  divisionName?: string;
}

interface Division {
  id: number;
  name: string;
}

const DepartmentsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [records, setRecords] = useState<DepartmentRecord[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DepartmentRecord | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    divisionId: undefined as number | undefined
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load departments
      const departmentsResponse = await apiRequest.get('/system/departments');
      if (departmentsResponse.ok) {
        const departmentsData = await departmentsResponse.json();
        console.log('Loaded departments:', departmentsData);
        setRecords(departmentsData);
      }

      // Load divisions for the dropdown
      const divisionsResponse = await apiRequest.get('/system/divisions');
      if (divisionsResponse.ok) {
        const divisionsData = await divisionsResponse.json();
        console.log('Loaded divisions:', divisionsData);
        setDivisions(divisionsData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת הנתונים מהשרת",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData({ name: '', divisionId: undefined });
    setIsDialogOpen(true);
  };

  const handleEdit = (record: DepartmentRecord) => {
    setEditingRecord(record);
    setFormData({ 
      name: record.name, 
      divisionId: record.divisionId 
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "שגיאה",
        description: "שם מחלקה הוא שדה חובה",
        variant: "destructive"
      });
      return;
    }

    try {
      let response;
      if (editingRecord) {
        // Update existing
        response = await apiRequest.put(`/system/departments/${editingRecord.id}`, formData);
      } else {
        // Create new
        response = await apiRequest.post('/system/departments', formData);
      }

      if (response.ok) {
        const savedRecord = await response.json();
        console.log('Saved department:', savedRecord);
        
        // Add division name for display
        const division = divisions.find(d => d.id === savedRecord.division_id);
        const transformedRecord = {
          id: savedRecord.id,
          name: savedRecord.name,
          divisionId: savedRecord.division_id,
          divisionName: division?.name
        };

        if (editingRecord) {
          setRecords(prev => prev.map(record => 
            record.id === editingRecord.id ? transformedRecord : record
          ));
          toast({
            title: "הצלחה",
            description: "הרשומה עודכנה בהצלחה"
          });
        } else {
          setRecords(prev => [...prev, transformedRecord]);
          toast({
            title: "הצלחה",
            description: "הרשומה נוספה בהצלחה"
          });
        }

        setIsDialogOpen(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "שגיאה",
          description: errorData.error || "שגיאה בשמירת הנתונים",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving department:', error);
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
        const response = await apiRequest.delete(`/system/departments/${id}`);
        
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
        console.error('Error deleting department:', error);
        toast({
          title: "שגיאה",
          description: "שגיאה במחיקת הרשומה",
          variant: "destructive"
        });
      }
    }
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
              ניהול מחלקות
            </h1>
          </div>
          
          <Card>
            <CardHeader className="text-right">
              <div className="flex justify-between items-center">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAdd}>
                      <Plus className="w-4 h-4 ml-2" />
                      הוספת רשומה חדשה
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader className="text-right">
                      <DialogTitle>
                        {editingRecord ? 'עריכת רשומה' : 'הוספת רשומה חדשה'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4" dir="rtl">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-right">
                          שם מחלקה <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="text-right"
                          placeholder="הכנס שם מחלקה"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="divisionId" className="text-right">
                          שייכות לאגף
                        </Label>
                        <Select
                          value={formData.divisionId ? formData.divisionId.toString() : ''}
                          onValueChange={(value) => setFormData(prev => ({ 
                            ...prev, 
                            divisionId: value ? parseInt(value) : undefined 
                          }))}
                        >
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="בחר אגף" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">ללא אגף</SelectItem>
                            {divisions.map(division => (
                              <SelectItem key={division.id} value={division.id.toString()}>
                                {division.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSave} className="flex-1">
                          שמירה
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                          className="flex-1"
                        >
                          ביטול
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <div>
                  <CardTitle className="text-xl">Department</CardTitle>
                  <p className="text-gray-600 mt-1">ניהול רשימת המחלקות והגופים המקצועיים</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center w-24">פעולות</TableHead>
                      <TableHead className="text-right">שם מחלקה</TableHead>
                      <TableHead className="text-right">שייכות לאגף</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                          אין רשומות להצגה
                        </TableCell>
                      </TableRow>
                    ) : (
                      records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="text-center">
                            <div className="flex gap-2 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(record)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(record.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{record.name}</TableCell>
                          <TableCell className="text-right">{record.divisionName || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DepartmentsManagement;