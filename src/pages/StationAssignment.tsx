
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Program, currentUser, STATUS_CONFIG, mockPrograms } from '../types';
import { Button } from '../components/ui/button';
import { ArrowRight, Save, Lock } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import ProgramForm from '../components/program/ProgramForm';
import StationAssignmentForm from '../components/stations/StationAssignmentForm';
import StatusBadge from '../components/common/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

// Declare global validation function
declare global {
  interface Window {
    validateStationAssignment?: () => boolean;
  }
}

const StationAssignment = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { toast } = useToast();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // Find program from mock data
  const initialProgram = mockPrograms.find(p => p.taskId === Number(taskId));
  
  if (!initialProgram) {
    return (
      <AppLayout currentRoute="/station-assignment">
        <div className="text-center py-12">
          <p className="text-gray-500">משימה לא נמצאה</p>
        </div>
      </AppLayout>
    );
  }

  const [program, setProgram] = useState<Program>(initialProgram);

  const handleBack = () => {
    navigate('/');
  };

  const handleSave = () => {
    toast({
      title: "שינויים נשמרו",
      description: "פרטי המשימה נשמרו בהצלחה",
    });
  };

  const handleFreeze = () => {
    // Validate station assignment if program is in OPEN status
    if (program.status === 'Open') {
      if (window.validateStationAssignment && !window.validateStationAssignment()) {
        return; // Validation failed, error already shown by validation function
      }
      
      // Update status to PLAN
      const updatedProgram = {
        ...program,
        status: 'Plan' as const,
        lastUpdate: new Date()
      };
      setProgram(updatedProgram);
      
      toast({
        title: "המשימה קובעה",
        description: "המשימה עברה לשלב תכנון",
      });
    } else {
      toast({
        title: "המשימה קובעה",
        description: "לא ניתן לערוך את המשימה יותר",
      });
    }
  };

  const handleProgramUpdate = (updatedProgram: Program) => {
    setProgram(updatedProgram);
  };

  // Check permissions - allowing full access for technical users and procurement managers
  const canEdit = currentUser.role === 'procurement_manager' || currentUser.role === 'technical_maintainer';
  const canSave = canEdit || 
    (currentUser.role === 'requester' && program.status === 'Open') ||
    (['procurement_officer', 'team_leader'].includes(currentUser.role) && 
     ['Open', 'Plan', 'In Progress'].includes(program.status));
  
  const canView = canEdit || 
    (currentUser.role === 'requester') ||
    (['procurement_officer', 'team_leader'].includes(currentUser.role) && 
     ['Open', 'Plan', 'In Progress'].includes(program.status));

  const canFreeze = canEdit && ['Open', 'Plan'].includes(program.status);

  // Show permission dialog instead of blocking access
  const handlePermissionDenied = () => {
    setShowPermissionDialog(true);
  };

  return (
    <AppLayout currentRoute="/station-assignment" pageTitle={`עדכון משימה #${program.taskId}`}>
      <div className="min-h-screen bg-gray-50" style={{ transform: 'scale(0.75)', transformOrigin: 'top right' }}>
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
              <StatusBadge status={program.status} size="md" />
              {canSave ? (
                <Button onClick={handleSave} className="flex items-center gap-2 text-sm px-3 py-1.5">
                  <Save className="w-3 h-3" />
                  שמירה
                </Button>
              ) : (
                <Button onClick={handlePermissionDenied} className="flex items-center gap-2 text-sm px-3 py-1.5">
                  <Save className="w-3 h-3" />
                  שמירה
                </Button>
              )}
              {canFreeze ? (
                <Button onClick={handleFreeze} variant="secondary" className="flex items-center gap-2 text-sm px-3 py-1.5">
                  <Lock className="w-3 h-3" />
                  קיבוע
                </Button>
              ) : (
                <Button onClick={handlePermissionDenied} variant="secondary" className="flex items-center gap-2 text-sm px-3 py-1.5">
                  <Lock className="w-3 h-3" />
                  קיבוע
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex" style={{ height: 'calc(100vh - 60px)' }}>
          {/* Left Side - Program Details */}
          <div className="w-1/3 p-4 overflow-y-auto bg-white border-r">
            <ProgramForm 
              program={program}
              canEdit={canEdit}
              onProgramUpdate={handleProgramUpdate}
              isEditing={false}
              onSave={handleSave}
              onCancel={() => {}}
            />
          </div>

          {/* Right Side - Station Assignment */}
          <div className="w-2/3 p-4 overflow-y-auto bg-gray-50">
            <StationAssignmentForm 
              program={program}
              canEdit={canEdit}
              onSave={handleSave}
              onProgramUpdate={handleProgramUpdate}
            />
          </div>
        </div>

        {/* Permission Dialog */}
        <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
          <DialogContent className="text-right">
            <DialogHeader>
              <DialogTitle>אין הרשאה</DialogTitle>
              <DialogDescription>
                אין לך הרשאה לבצע פעולה זו. פנה למנהל המערכת לקבלת הרשאות נוספות.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowPermissionDialog(false)}>
                סגור
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default StationAssignment;
