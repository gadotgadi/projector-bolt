
import React, { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const StructureValues: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [structureValues, setStructureValues] = useState({
    division: 'אגף',
    department: 'מחלקה',
    team: 'צוות'
  });

  const structureFields = [
    { 
      key: 'division', 
      label: 'Division - כינוי אגף', 
      placeholder: 'דוגמאות: אגף / חטיבה / מרחב / מחוז / מפעל / לקוח'
    },
    { 
      key: 'department', 
      label: 'Department - כינוי מחלקה', 
      placeholder: 'דוגמאות: מחלקה / ענף / מוביל טכני / מזמין'
    },
    { 
      key: 'team', 
      label: 'Team - כינוי צוות', 
      placeholder: 'דוגמאות: צוות / מדור / חוליה / קבוצה / שלוחה / תחום'
    }
  ];

  const handleInputChange = (key: string, value: string) => {
    setStructureValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    toast({
      title: "הצלחה",
      description: "כינויי המבנה הארגוני נשמרו בהצלחה"
    });
  };

  return (
    <AppLayout currentRoute="/infrastructure-maintenance">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/infrastructure-maintenance')}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה לתחזוקת תשתיות
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 text-right">
              כינויי מבנה ארגוני
            </h1>
          </div>
          
          <Card>
            <CardHeader className="text-right">
              <CardTitle className="text-xl">הגדרת כינויים לגופים במבנה הארגוני</CardTitle>
              <p className="text-gray-600 mt-1">Structure Value - קביעת הכינויים העבריים לגופים הארגוניים</p>
            </CardHeader>
            <CardContent className="space-y-6" dir="rtl">
              {structureFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="text-right font-medium">
                    {field.label}
                  </Label>
                  <Input
                    id={field.key}
                    value={structureValues[field.key as keyof typeof structureValues]}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="text-right"
                  />
                </div>
              ))}
              
              <div className="flex justify-center pt-4">
                <Button onClick={handleSave} className="px-8">
                  שמירת שינויים
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default StructureValues;
