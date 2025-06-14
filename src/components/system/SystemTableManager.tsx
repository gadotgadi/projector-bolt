
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TableField {
  key: string;
  label: string;
  type: 'text' | 'number';
  required?: boolean;
}

interface TableRecord {
  id: number;
  [key: string]: any;
}

interface SystemTableManagerProps {
  title: string;
  description: string;
  fields: TableField[];
  records: TableRecord[];
  onAdd: (record: Omit<TableRecord, 'id'>) => void;
  onUpdate: (id: number, record: Partial<TableRecord>) => void;
  onDelete: (id: number) => void;
}

const SystemTableManager: React.FC<SystemTableManagerProps> = ({
  title,
  description,
  fields,
  records,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TableRecord | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const initializeForm = (record?: TableRecord) => {
    const initialData: Record<string, any> = {};
    fields.forEach(field => {
      initialData[field.key] = record ? record[field.key] || '' : '';
    });
    setFormData(initialData);
  };

  const handleAdd = () => {
    initializeForm();
    setEditingRecord(null);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (record: TableRecord) => {
    initializeForm(record);
    setEditingRecord(record);
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    // Validate required fields
    const missingFields = fields
      .filter(field => field.required && !formData[field.key])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast({
        title: "שגיאה",
        description: `יש למלא את השדות החובה: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    if (editingRecord) {
      onUpdate(editingRecord.id, formData);
      toast({
        title: "הצלחה",
        description: "הרשומה עודכנה בהצלחה"
      });
    } else {
      onAdd(formData);
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
      onDelete(id);
      toast({
        title: "הצלחה",
        description: "הרשומה נמחקה בהצלחה"
      });
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-right">
          <div className="flex justify-between items-center">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  {fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key} className="text-right">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id={field.key}
                        type={field.type}
                        value={formData[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="text-right"
                        placeholder={`הכנס ${field.label}`}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      שמירה
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      className="flex-1"
                    >
                      ביטול
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <p className="text-gray-600 mt-1">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-24">פעולות</TableHead>
                  {fields.map((field) => (
                    <TableHead key={field.key} className="text-right">
                      {field.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={fields.length + 1} 
                      className="text-center text-gray-500 py-8"
                    >
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
                      {fields.map((field) => (
                        <TableCell key={field.key} className="text-right">
                          {record[field.key] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemTableManager;
