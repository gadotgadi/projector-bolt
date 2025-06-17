import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Save, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '../utils/api';

interface ComplexityEstimate {
  estimateLevel1: number;
  estimateLevel2: number;
  estimateLevel3: number;
}

interface AcceptanceOption {
  id: number;
  yearId: number;
  uploadCode: 'Plan' | 'Late' | 'Block' | 'Finish';
  uploadCodeDescription: string;
  broadMeaning?: string;
}

const PlanningHelpers: React.FC = () => {
  const { toast } = useToast();
  
  // State for complexity estimates
  const [complexityEstimate, setComplexityEstimate] = useState<ComplexityEstimate>({
    estimateLevel1: 5,
    estimateLevel2: 10,
    estimateLevel3: 20
  });

  // State for acceptance options
  const [acceptanceOptions, setAcceptanceOptions] = useState<AcceptanceOption[]>([]);
  const [loading, setLoading] = useState(true);

  // State for new acceptance option dialog
  const [isNewOptionDialogOpen, setIsNewOptionDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<AcceptanceOption | null>(null);
  const [newOptionForm, setNewOptionForm] = useState({
    yearId: new Date().getFullYear() + 1,
    uploadCode: 'Plan' as const,
    broadMeaning: ''
  });

  // Upload code descriptions mapping
  const uploadCodeDescriptions = {
    'Plan': 'מתוכנן',
    'Late': 'מאחר',
    'Block': 'חסום',
    'Finish': 'הסתיים'
  };

  // Upload code meanings
  const uploadCodeMeanings = {
    'Plan': 'פתוח לקליטת דרישות חדשות לשנה הרלוונטית. גורמים דורשים יכולים להעלות דרישות. הערך בשדה "מקור תכנון" יהיה "תכנון שנתי".',
    'Late': 'אפשר להעלות דרישות חדשות לשנה הרלוונטית, אולם אלו דרישות חריגות. הערך בשדה "מקור תכנון" יהיה "בלתי מתוכנן".',
    'Block': 'המערכת חסומה להעלאת דרישות מצד גורמים דורשים. רק למנהל הרכש הרשאה לפתוח דרישה חדשה והוא גם קובע ידנית מהו מקור התכנון.',
    'Finish': 'לא ניתן להעלות דרישות חדשות עבור השנה הרלוונטית. באחריות מנהל הרכש לוודא העברה למצב זה לקראת סיום השנה.'
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load complexity estimates
      const complexityRes = await apiRequest.get('/planning/complexity-estimates');
      if (complexityRes.ok) {
        const complexityData = await complexityRes.json();
        setComplexityEstimate(complexityData);
      }

      // Load acceptance options
      const acceptanceRes = await apiRequest.get('/planning/acceptance-options');
      if (acceptanceRes.ok) {
        const acceptanceData = await acceptanceRes.json();
        setAcceptanceOptions(acceptanceData.data || []);
      }

    } catch (error) {
      console.error('Error loading planning helpers data:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת הנתונים מהשרת",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplexityEstimateChange = (field: keyof ComplexityEstimate, value: string) => {
    const numValue = parseInt(value) || 0;
    setComplexityEstimate(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSaveComplexityEstimate = async () => {
    try {
      const response = await apiRequest.put('/planning/complexity-estimates', complexityEstimate);
      
      if (response.ok) {
        toast({
          title: "נשמר בהצלחה",
          description: "הערכות ימי הטיפול במשימה עודכנו"
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "שגיאה",
          description: errorData.error || "שגיאה בשמירת הנתונים",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving complexity estimates:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בשמירת הנתונים",
        variant: "destructive"
      });
    }
  };

  const handleNewAcceptanceOption = () => {
    setEditingOption(null);
    setNewOptionForm({
      yearId: new Date().getFullYear() + 1,
      uploadCode: 'Plan',
      broadMeaning: ''
    });
    setIsNewOptionDialogOpen(true);
  };

  const handleEditAcceptanceOption = (option: AcceptanceOption) => {
    setEditingOption(option);
    setNewOptionForm({
      yearId: option.yearId,
      uploadCode: option.uploadCode,
      broadMeaning: option.broadMeaning || ''
    });
    setIsNewOptionDialogOpen(true);
  };

  const handleSaveAcceptanceOption = async () => {
    try {
      const uploadCodeDescription = uploadCodeDescriptions[newOptionForm.uploadCode];
      const defaultMeaning = uploadCodeMeanings[newOptionForm.uploadCode];

      const optionData = {
        yearId: newOptionForm.yearId,
        uploadCode: newOptionForm.uploadCode,
        broadMeaning: newOptionForm.broadMeaning || defaultMeaning
      };

      let response;
      if (editingOption) {
        // Update existing
        response = await apiRequest.put(`/planning/acceptance-options/${editingOption.id}`, optionData);
      } else {
        // Create new
        response = await apiRequest.post('/planning/acceptance-options', optionData);
      }

      if (response.ok) {
        const savedOption = await response.json();
        
        if (editingOption) {
          setAcceptanceOptions(prev => prev.map(opt => 
            opt.id === editingOption.id ? savedOption : opt
          ));
          toast({
            title: "עודכן בהצלחה",
            description: `רשומת שנת ${newOptionForm.yearId} עודכנה`
          });
        } else {
          setAcceptanceOptions(prev => [...prev, savedOption].sort((a, b) => b.yearId - a.yearId));
          toast({
            title: "נוסף בהצלחה",
            description: `רשומה חדשה עבור שנת ${newOptionForm.yearId} נוספה`
          });
        }

        setIsNewOptionDialogOpen(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "שגיאה",
          description: errorData.error || "שגיאה בשמירת הנתונים",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving acceptance option:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בשמירת הנתונים",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAcceptanceOption = async (id: number) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) {
      try {
        const response = await apiRequest.delete(`/planning/acceptance-options/${id}`);
        
        if (response.ok) {
          setAcceptanceOptions(prev => prev.filter(opt => opt.id !== id));
          toast({
            title: "נמחק בהצלחה",
            description: "הרשומה נמחקה"
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
        console.error('Error deleting acceptance option:', error);
        toast({
          title: "שגיאה",
          description: "שגיאה במחיקת הרשומה",
          variant: "destructive"
        });
      }
    }
  };

  const getUploadCodeColor = (code: string) => {
    switch (code) {
      case 'Plan': return 'bg-green-100 text-green-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Block': return 'bg-red-100 text-red-800';
      case 'Finish': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AppLayout currentRoute="/planning-helpers">
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
    <AppLayout currentRoute="/planning-helpers">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Complexity Estimate Card */}
          <Card>
            <CardHeader className="text-right">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  📊
                </div>
                ימי טיפול במשימה
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Complexity estimate - הערכת היקף ימי עבודה נדרשים למימוש משימות לפי רמת מורכבות
              </p>
            </CardHeader>
            <CardContent className="space-y-4" dir="rtl">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="level1" className="text-right">
                    הערכת ימי עבודה לרמת מורכבות 1 (פשוט)
                  </Label>
                  <Input
                    id="level1"
                    type="number"
                    min="1"
                    max="365"
                    value={complexityEstimate.estimateLevel1}
                    onChange={(e) => handleComplexityEstimateChange('estimateLevel1', e.target.value)}
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="level2" className="text-right">
                    הערכת ימי עבודה לרמת מורכבות 2 (בינוני)
                  </Label>
                  <Input
                    id="level2"
                    type="number"
                    min="1"
                    max="365"
                    value={complexityEstimate.estimateLevel2}
                    onChange={(e) => handleComplexityEstimateChange('estimateLevel2', e.target.value)}
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="level3" className="text-right">
                    הערכת ימי עבודה לרמת מורכבות 3 (מורכב)
                  </Label>
                  <Input
                    id="level3"
                    type="number"
                    min="1"
                    max="365"
                    value={complexityEstimate.estimateLevel3}
                    onChange={(e) => handleComplexityEstimateChange('estimateLevel3', e.target.value)}
                    className="text-right"
                  />
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button onClick={handleSaveComplexityEstimate} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  שמירת שינויים
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Acceptance Options Card */}
          <Card>
            <CardHeader className="text-right">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                  📋
                </div>
                העלאת דרישות
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Acceptance option - ציון יכולת העלאת דרישות במסגרת תוכנית עבודה שנתית
              </p>
            </CardHeader>
            <CardContent dir="rtl">
              <div className="space-y-4">
                {/* Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center w-24">פעולות</TableHead>
                        <TableHead className="text-right">שנת עבודה</TableHead>
                        <TableHead className="text-right">קוד העלאה</TableHead>
                        <TableHead className="text-right">פירוש קוד</TableHead>
                        <TableHead className="text-right">משמעות רחבה</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {acceptanceOptions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                            אין רשומות להצגה
                          </TableCell>
                        </TableRow>
                      ) : (
                        acceptanceOptions.map((option) => (
                          <TableRow key={option.id}>
                            <TableCell className="text-center">
                              <div className="flex gap-2 justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditAcceptanceOption(option)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAcceptanceOption(option.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {option.yearId}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`px-2 py-1 rounded text-sm ${getUploadCodeColor(option.uploadCode)}`}>
                                {option.uploadCode}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {option.uploadCodeDescription}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {option.broadMeaning}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Add New Button */}
                <div className="flex justify-center">
                  <Dialog open={isNewOptionDialogOpen} onOpenChange={setIsNewOptionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleNewAcceptanceOption} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        חדש
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader className="text-right">
                        <DialogTitle>
                          {editingOption ? 'עריכת רשומה' : 'הוספת רשומה חדשה'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4" dir="rtl">
                        <div className="space-y-2">
                          <Label htmlFor="yearId" className="text-right">
                            שנת עבודה <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="yearId"
                            type="number"
                            min="2020"
                            max="2050"
                            value={newOptionForm.yearId}
                            onChange={(e) => setNewOptionForm(prev => ({ 
                              ...prev, 
                              yearId: parseInt(e.target.value) || new Date().getFullYear() 
                            }))}
                            className="text-right"
                            placeholder="הכנס שנת עבודה"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="uploadCode" className="text-right">
                            קוד העלאה <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={newOptionForm.uploadCode}
                            onValueChange={(value: 'Plan' | 'Late' | 'Block' | 'Finish') => 
                              setNewOptionForm(prev => ({ 
                                ...prev, 
                                uploadCode: value,
                                broadMeaning: '' // Reset broad meaning when code changes
                              }))
                            }
                          >
                            <SelectTrigger className="text-right">
                              <SelectValue placeholder="בחר קוד העלאה" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Plan">Plan - מתוכנן</SelectItem>
                              <SelectItem value="Late">Late - מאחר</SelectItem>
                              <SelectItem value="Block">Block - חסום</SelectItem>
                              <SelectItem value="Finish">Finish - הסתיים</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="broadMeaning" className="text-right">
                            משמעות רחבה (רשות)
                          </Label>
                          <Textarea
                            id="broadMeaning"
                            value={newOptionForm.broadMeaning}
                            onChange={(e) => setNewOptionForm(prev => ({ 
                              ...prev, 
                              broadMeaning: e.target.value 
                            }))}
                            className="text-right min-h-[100px]"
                            placeholder={uploadCodeMeanings[newOptionForm.uploadCode]}
                          />
                          <p className="text-xs text-gray-500">
                            אם לא יוזן טקסט, יוצג הטקסט הברירת מחדל לקוד זה
                          </p>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleSaveAcceptanceOption} className="flex-1">
                            שמירה
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsNewOptionDialogOpen(false)}
                            className="flex-1"
                          >
                            ביטול
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default PlanningHelpers;