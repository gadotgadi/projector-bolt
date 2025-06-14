
import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockEngagementTypes } from '../data/engagementTypesData';
import type { EngagementTypeDefinition } from '../types/engagementTypes';

// Extended type for the UI with additional fields
interface EngagementType extends EngagementTypeDefinition {
  procurementMethod: string;
  description: string;
  thresholdAmount?: number;
  legalBasis?: string;
  requiredDocuments?: string;
  approvalProcess?: string;
  timeframe?: string;
  notes?: string;
}

const EngagementTypes: React.FC = () => {
  const { toast } = useToast();
  
  // Convert mock data to the extended format
  const initialData: EngagementType[] = mockEngagementTypes.map(type => ({
    ...type,
    procurementMethod: type.name,
    description: `תיאור עבור ${type.name}`,
    thresholdAmount: type.id === 1 ? 500000 : type.id === 2 ? 250000 : 50000,
    timeframe: type.id === 1 ? '90 ימים' : type.id === 2 ? '60 ימים' : '30 ימים'
  }));

  const [engagementTypes, setEngagementTypes] = useState<EngagementType[]>(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<EngagementType>>({});

  const handleEdit = (engagement: EngagementType) => {
    setEditingId(engagement.id);
    setFormData(engagement);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      procurementMethod: '',
      description: '',
      thresholdAmount: 0,
      legalBasis: '',
      requiredDocuments: '',
      approvalProcess: '',
      timeframe: '',
      notes: ''
    });
  };

  const handleSave = () => {
    if (!formData.procurementMethod || !formData.description) {
      toast({
        title: "שגיאה",
        description: "יש למלא שדות חובה",
        variant: "destructive"
      });
      return;
    }

    if (isAdding) {
      const newId = Math.max(...engagementTypes.map(e => e.id)) + 1;
      const newEngagement: EngagementType = {
        ...formData as EngagementType,
        id: newId,
        name: formData.procurementMethod || ''
      };
      setEngagementTypes([...engagementTypes, newEngagement]);
      toast({
        title: "הצלחה",
        description: "סוג התקשרות נוסף בהצלחה"
      });
    } else if (editingId) {
      setEngagementTypes(engagementTypes.map(e => 
        e.id === editingId ? { ...e, ...formData, name: formData.procurementMethod || e.name } : e
      ));
      toast({
        title: "הצלחה", 
        description: "סוג התקשרות עודכן בהצלחה"
      });
    }

    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const handleDelete = (id: number) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק סוג התקשרות זה?')) {
      setEngagementTypes(engagementTypes.filter(e => e.id !== id));
      toast({
        title: "הצלחה",
        description: "סוג התקשרות נמחק בהצלחה"
      });
    }
  };

  return (
    <AppLayout currentRoute="/engagement-types">
      <div className="space-y-6">
        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <Card>
            <CardHeader className="text-right">
              <CardTitle>
                {isAdding ? 'הוספת סוג התקשרות חדש' : 'עריכת סוג התקשרות'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4 text-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="procurementMethod">שיטת רכש *</Label>
                    <Input
                      id="procurementMethod"
                      value={formData.procurementMethod || ''}
                      onChange={(e) => setFormData({ ...formData, procurementMethod: e.target.value })}
                      className="text-right"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thresholdAmount">סכום סף</Label>
                    <Input
                      id="thresholdAmount"
                      type="number"
                      value={formData.thresholdAmount || ''}
                      onChange={(e) => setFormData({ ...formData, thresholdAmount: Number(e.target.value) })}
                      className="text-right"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">תיאור *</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="text-right"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="legalBasis">תנאי הגדרה</Label>
                  <Input
                    id="legalBasis"
                    value={formData.legalBasis || ''}
                    onChange={(e) => setFormData({ ...formData, legalBasis: e.target.value })}
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="requiredDocuments">תנאי הדרדרה</Label>
                  <Input
                    id="requiredDocuments"
                    value={formData.requiredDocuments || ''}
                    onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="approvalProcess">תהליך אישור</Label>
                  <Input
                    id="approvalProcess"
                    value={formData.approvalProcess || ''}
                    onChange={(e) => setFormData({ ...formData, approvalProcess: e.target.value })}
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="timeframe">תקופת ביצוע</Label>
                  <Input
                    id="timeframe"
                    value={formData.timeframe || ''}
                    onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">הערות</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="text-right"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-start">
                  <Button onClick={handleSave} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    שמור
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    ביטול
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Main Table */}
        <Card>
          <CardHeader className="text-right">
            <div className="flex justify-between items-center">
              <Button onClick={handleAdd} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                הוסף סוג התקשרות
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-right font-semibold">שיטת רכש</th>
                    <th className="p-3 text-right font-semibold">תיאור</th>
                    <th className="p-3 text-right font-semibold">סכום סף</th>
                    <th className="p-3 text-right font-semibold">זמן ביצוע</th>
                    <th className="p-3 text-right font-semibold">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {engagementTypes.map((engagement) => (
                    <tr key={engagement.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{engagement.procurementMethod}</td>
                      <td className="p-3">{engagement.description}</td>
                      <td className="p-3">
                        {engagement.thresholdAmount ? 
                          `₪${engagement.thresholdAmount.toLocaleString()}` : 
                          'ללא הגבלה'
                        }
                      </td>
                      <td className="p-3">{engagement.timeframe}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(engagement)}
                            className="flex items-center gap-1"
                          >
                            <Pencil className="w-4 h-4" />
                            ערוך
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(engagement.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                            מחק
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default EngagementTypes;
