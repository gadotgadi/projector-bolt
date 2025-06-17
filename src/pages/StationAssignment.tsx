import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Program } from '../types';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';
import { mockPrograms } from '../data/mockPrograms';

const StationAssignment = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();

  console.log('🔥 StationAssignment: נטען עם taskId:', taskId);
  console.log('🔥 StationAssignment: משימות זמינות:', mockPrograms.map(p => p.taskId));

  // Find program from mock data
  const initialProgram = mockPrograms.find(p => p.taskId === Number(taskId));
  
  console.log('🔥 StationAssignment: משימה נמצאה:', !!initialProgram);
  console.log('🔥 StationAssignment: פרטי משימה:', initialProgram);
  
  if (!initialProgram) {
    console.log('❌ StationAssignment: משימה לא נמצאה עבור taskId:', taskId);
    return (
      <AppLayout currentRoute="/station-assignment">
        <div className="text-center py-12">
          <p className="text-gray-500">משימה לא נמצאה (ID: {taskId})</p>
          <p className="text-gray-400 text-sm mt-2">
            משימות זמינות: {mockPrograms.map(p => p.taskId).join(', ')}
          </p>
          <Button onClick={() => navigate('/')} className="mt-4">
            חזרה לשולחן העבודה
          </Button>
        </div>
      </AppLayout>
    );
  }

  const [program] = useState<Program>(initialProgram);

  const handleBack = () => {
    console.log('🔥 StationAssignment: חזרה לשולחן העבודה');
    navigate('/');
  };

  console.log('🔥 StationAssignment: מציג מסך טיפול במשימה:', program.taskId);

  return (
    <AppLayout currentRoute="/station-assignment" pageTitle={`עדכון משימה #${program.taskId}`}>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                חזרה
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">משימה #{program.taskId}</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-bold mb-4 text-right">{program.title}</h2>
            
            <div className="grid grid-cols-2 gap-6 text-right">
              <div>
                <h3 className="font-semibold mb-2">פרטי המשימה</h3>
                <p><strong>גורם דורש:</strong> {program.requesterName}</p>
                <p><strong>אגף:</strong> {program.divisionName}</p>
                <p><strong>סטטוס:</strong> {program.status}</p>
                {program.description && (
                  <p><strong>תיאור:</strong> {program.description}</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">מידע נוסף</h3>
                <p><strong>שנת עבודה:</strong> {program.workYear}</p>
                {program.estimatedAmount && (
                  <p><strong>אומדן:</strong> {program.estimatedAmount.toLocaleString()} {program.currency}</p>
                )}
                {program.assignedOfficerName && (
                  <p><strong>קניין מטפל:</strong> {program.assignedOfficerName}</p>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800 font-medium">
                ✅ מסך שיבוץ תחנות נטען בהצלחה!
              </p>
              <p className="text-green-700 text-sm mt-1">
                כאן יוצגו תחנות העבודה ואפשרויות השיבוץ
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StationAssignment;