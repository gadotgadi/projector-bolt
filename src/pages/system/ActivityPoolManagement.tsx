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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { apiRequest } from '../../utils/api';

interface ActivityPoolRecord {
  id: number;
  name: string;
  toolsAndResources?: string;
}

const ActivityPoolManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [records, setRecords] = useState<ActivityPoolRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ActivityPoolRecord | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    toolsAndResources: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiRequest.get('/system/activity-pool');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded activities:', data);
        
        // Transform data to match frontend format
        const transformedData = data.map((activity: any) => ({
          id: activity.id,
          name: activity.name,
          toolsAndResources: activity.tools_and_resources
        }));
        
        setRecords(transformedData);
      } else {
        throw new Error('Failed to load activities');
      }
    } catch (error) {
      console.error('Error loading activities:', error);
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
    setFormData({ name: '', toolsAndResources: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (record: ActivityPoolRecord) => {
    setEditingRecord(record);
    setFormData({ 
      name: record.name, 
      toolsAndResources: record.toolsAndResources || '' 
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "שגיאה",
        description: "שם הפעילות הוא שדה חובה",
        variant: "destructive"
      });
      return;
    }

    try {
      let response;
      if (editingRecord) {
        // Update existing
        response = await apiRequest.put(`/system/activity-pool/${editingRecord.id}`, formData);
      } else {
        // Create new
        response = await apiRequest.post('/system/activity-pool', formData);
      }

      if (response.ok) {
        const savedRecord = await response.json();
        console.log('Saved activity:', savedRecord);
        
        // Transform response to match frontend format
        const transformedRecord = {
          id: savedRecord.id,
          name: savedRecord.name,
          toolsAndResources: savedRecord.tools_and_resources
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
      console.error('Error saving activity:', error);
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
        const response = await apiRequest.delete(`/system/activity-pool/${id}`);
        
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
        console.error('Error deleting activity:', error);
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
              ניהול פעילויות רכש
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
                          שם הפעילות <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="text-right"
                          placeholder="הכנס שם פעילות"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="toolsAndResources" className="text-right">
                          כלים ומשאבים
                        </Label>
                        <Input
                          id="toolsAndResources"
                          value={formData.toolsAndResources}
                          onChange={(e) => setFormData(prev => ({ ...prev, toolsAndResources: e.target.value }))}
                          className="text-right"
                          placeholder="הכנס כלים ומשאבים"
                        />
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
                  <CardTitle className="text-xl">Activity Pool</CardTitle>
                  <p className="text-gray-600 mt-1">ניהול פעילויות הרכש במערכת</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center w-24">פעולות</TableHead>
                      <TableHead className="text-right">שם הפעילות</TableHead>
                      <TableHead className="text-right">כלים ומשאבים</TableHead>
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
                          <TableCell className="text-right">{record.toolsAndResources || '-'}</TableCell>
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

export default ActivityPoolManagement;