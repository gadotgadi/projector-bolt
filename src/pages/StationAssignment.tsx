import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Program } from '../types';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';
import { mockPrograms } from '../data/mockPrograms';
import { useAuth } from '../components/auth/AuthProvider';

const StationAssignment = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { user } = useAuth();

  console.log('🔥🔥🔥 STATION ASSIGNMENT COMPONENT LOADED!');
  console.log('🔥 StationAssignment: נטען עם taskId:', taskId, 'type:', typeof taskId);
  console.log('🔥 StationAssignment: משימות זמינות:', mockPrograms.map(p => p.taskId));

  // Convert taskId from string to number for comparison
  const taskIdNumber = taskId ? parseInt(taskId, 10) : null;
  console.log('🔥 StationAssignment: taskIdNumber:', taskIdNumber, 'type:', typeof taskIdNumber);

  // Find program from mock data using the converted number
  const initialProgram = mockPrograms.find(p => p.taskId === taskIdNumber);
  
  console.log('🔥 StationAssignment: משימה נמצאה:', !!initialProgram);
  console.log('🔥 StationAssignment: פרטי משימה:', initialProgram);
  
  if (!initialProgram) {
    console.log('❌ StationAssignment: משימה לא נמצאה עבור taskId:', taskId);
    return (
      <AppLayout currentRoute="/station-assignment">
        <div className="text-center py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>🚨 DEBUG INFO:</strong>
            <div>TaskId from URL: {taskId} (type: {typeof taskId})</div>
            <div>TaskId as number: {taskIdNumber} (type: {typeof taskIdNumber})</div>
            <div>Available TaskIds: {mockPrograms.map(p => p.taskId).join(', ')}</div>
            <div>First program taskId: {mockPrograms[0]?.taskId} (type: {typeof mockPrograms[0]?.taskId})</div>
          </div>
          <p className="text-gray-500">משימה לא נמצאה (ID: {taskId})</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            חזרה לשולחן העבודה
          </Button>
        </div>
      </AppLayout>
    );
  }

  const [program, setProgram] = useState<Program>(initialProgram);

  const handleBack = () => {
    console.log('🔥 StationAssignment: חזרה לשולחן העבודה');
    navigate('/');
  };

  console.log('🔥 StationAssignment: מציג מסך טיפול במשימה:', program.taskId);

  return (
    <AppLayout currentRoute="/station-assignment" pageTitle={`עדכון משימה #${program.taskId}`}>
      <div className="min-h-screen bg-gray-50">
        {/* SUCCESS MESSAGE */}
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>🎉 SUCCESS!</strong> StationAssignment component loaded successfully for task {program.taskId}!
          <div className="text-sm mt-2">
            URL taskId: {taskId} → Converted to: {taskIdNumber} → Found program: {program.title}
          </div>
        </div>

        {/* Header */}
        <div className="bg-white border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2 text-sm px-3 py-1.5">
                <ArrowRight className="w-3 h-3" />
                חזרה
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">משימה #{program.taskId}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="bg-white rounded-lg border p-6">
            <h1 className="text-2xl font-bold mb-4 text-right">{program.title}</h1>
            
            <div className="grid grid-cols-2 gap-6 text-right">
              <div>
                <h3 className="font-semibold mb-2">פרטי המשימה</h3>
                <p><strong>גורם דורש:</strong> {program.requesterName}</p>
                <p><strong>אגף:</strong> {program.divisionName}</p>
                <p><strong>סטטוס:</strong> {program.status}</p>
                <p><strong>שנת עבודה:</strong> {program.workYear}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">תיאור</h3>
                <p>{program.description || 'אין תיאור'}</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">מידע טכני</h3>
              <p>מסך זה יכלול את כל הפונקציונליות לניהול תחנות המשימה</p>
              <p>כרגע מוצג מידע בסיסי על המשימה לאימות שהניווט עובד</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StationAssignment;