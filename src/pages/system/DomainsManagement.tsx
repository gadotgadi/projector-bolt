import React, { useState } from 'react';
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

interface DomainRecord {
  id: number;
  description: string;
}

// Mock data for domains
const mockDomainsData: DomainRecord[] = [
  { id: 1, description: 'רכש לוגיסטי' },
  { id: 2, description: 'רכש טכנולוגי' },
  { id: 3, description: 'שירותים מקצועיים' },
  { id: 4, description: 'תחזוקה ותפעול' },
  { id: 5, description: 'ציוד משרדי' },
  { id: 6, description: 'תוכנה ומערכות' }
];

const DomainsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [records, setRecords] = useState<DomainRecord[]>(mockDomainsData);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DomainRecord | null>(null);
  const [formData, setFormData] = useState({
    description: ''
  });

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData({ description: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (record: DomainRecord) => {
    setEditingRecord(record);
    setFormData({ description: record.description });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.description.trim()) {
      toast({
        title: "שגיאה",
        description: "תיאור מילולי הוא שדה חובה",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      if (editingRecord) {
        // Update existing
        const updatedRecord = {
          ...editingRecord,
          description: formData.description
        };
        
        setRecords(prev => prev.map(record => 
          record.id === editingRecord.id ? updatedRecord : record
        ));
        
        toast({
          title: "הצלחה",
          description: "הרשומה עודכנה בהצלחה"
        });
      } else {
        // Create new
        const newRecord = {
          id: Math.max(...records.map(r => r.id)) + 1,
          description: formData.description
        };
        
        setRecords(prev => [...prev, newRecord]);
        
        toast({
          title: "הצלחה",
          description: "הרשומה נוספה בהצלחה"
        });
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving domain:', error);
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
        console.error('Error deleting domain:', error);
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
              ניהול תחומי רכש
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
                        <Label htmlFor="description" className="text-right">
                          תיאור מילולי <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="text-right"
                          placeholder="הכנס תיאור תחום הרכש"
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
                  <CardTitle className="text-xl">Domain</CardTitle>
                  <p className="text-gray-600 mt-1">ניהול תחומי הרכש האפשריים לסיווג המשימות (מצב הדגמה)</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center w-24">פעולות</TableHead>
                      <TableHead className="text-right">תיאור מילולי</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-gray-500 py-8">
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
                          <TableCell className="text-right">{record.description}</TableCell>
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

export default DomainsManagement;