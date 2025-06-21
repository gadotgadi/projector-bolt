import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Program, STATUS_CONFIG } from '../types';
import { Button } from '../components/ui/button';
import { ArrowRight, Save, Lock } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import ProgramForm from '../components/program/ProgramForm';
import StationAssignmentForm from '../components/stations/StationAssignmentForm';
import StatusBadge from '../components/common/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { mockPrograms } from '../data/mockPrograms';
import { useAuth } from '../components/auth/AuthProvider';

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
  const { user } = useAuth();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  console.log('StationAssignment component loaded with taskId:', taskId);

  // Find program from mock data
  const initialProgram = mockPrograms.find(p => p.taskId === Number(taskId));
  
  if (!initialProgram) {
    console.log('Program not found for taskId:', taskId);
    return (
      <AppLayout currentRoute="/station-assignment">
        <div className="text-center py-12">
          <p className="text-gray-500">משימה לא נמצאה (ID: {taskId})</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            חזרה לשולחן העבודה
          </Button>
        </div>
      </AppLayout>
    );
  }

  console.log('Program found:', initialProgram);

  const [program, setProgram] = useState<Program>(initialProgram);

  const handleBack = () => {
    navigate('/');
  };

  const handleSave = () => {
    // Validate based on status and user permissions
    if (program.status !== 'Open') {
      // For non-Open status, validate station assignment
      if (window.validateStationAssignment && !window.validateStationAssignment()) {
        return; // Validation failed
      }
    }

    // Check required fields for status transitions
    if (program.status === 'Open') {
      const requiredFields = ['assignedOfficerName', 'teamName', 'complexity', 'startDate'];
      const missingFields = requiredFields.filter(field => !program[field as keyof Program]);
      
      if (missingFields.length > 0) {
        toast({
          title: "שדות חובה חסרים",
          description: "יש למלא את כל השדות הנדרשים לפני השמירה",
          variant: "destructive"
        });
        return;
      }
    }

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
      
      // Check required fields
      const requiredFields = ['assignedOfficerName', 'teamName', 'complexity', 'startDate'];
      const missingFields = requiredFields.filter(field => !program[field as keyof Program]);
      
      if (missingFields.length > 0) {
        toast({
          title: "שדות חובה חסרים",
          description: "יש למלא את כל השדות הנדרשים לפני הקיבוע",
          variant: "destructive"
        });
        return;
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

  // Get user permissions based on role and status
  const getUserPermissions = () => {
    const roleCode = user?.roleCode;
    const status = program.status;
    
    return {
      canEdit: getEditPermission(roleCode, status),
      canSave: getSavePermission(roleCode, status),
      canFreeze: getFreezePermission(roleCode, status)
    };
  };

  const getEditPermission = (roleCode?: number, status?: string) => {
    // גורם דורש can only edit in Open status (but this redirects to new task form)
    if (roleCode === 4) {
      return status === 'Open';
    }
    
    // מנהל רכש can edit in most statuses
    if (roleCode === 1) {
      return ['Open', 'Plan', 'In Progress', 'Complete', 'Freeze'].includes(status || '');
    }
    
    // ראש צוות can edit in Plan, In Progress, and Complete (with permissions)
    if (roleCode === 2) {
      if (['Plan', 'In Progress'].includes(status || '')) return true;
      if (status === 'Complete') {
        // Check close permissions
        const closePermissions = 'Team leader'; // Mock value
        return closePermissions === 'Team leader';
      }
      return false;
    }
    
    // קניין can edit in Plan and In Progress
    if (roleCode === 3) {
      return ['Plan', 'In Progress'].includes(status || '');
    }
    
    return false;
  };

  const getSavePermission = (roleCode?: number, status?: string) => {
    // Same as edit permission for most cases
    return getEditPermission(roleCode, status);
  };

  const getFreezePermission = (roleCode?: number, status?: string) => {
    // Only מנהל רכש can freeze, and only in Open status
    return roleCode === 1 && status === 'Open';
  };

  const permissions = getUserPermissions();

  // Show permission dialog instead of blocking access
  const handlePermissionDenied = () => {
    setShowPermissionDialog(true);
  };

  // Check if user should be redirected to new task form
  if (user?.roleCode === 4 && program.status === 'Open') {
    // Redirect to new task form for גורם דורש in Open status
    navigate(`/new-task?taskId=${program.taskId}`);
    return null;
  }

  return (
    <AppLayout currentRoute="/station-assignment" pageTitle={`טיפול במשימה #${program.taskId}`}>
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
              {permissions.canSave ? (
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
              {permissions.canFreeze ? (
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
              canEdit={permissions.canEdit}
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
              canEdit={permissions.canEdit}
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