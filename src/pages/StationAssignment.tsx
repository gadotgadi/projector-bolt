import React, { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);

  console.log('StationAssignment component loaded with taskId:', taskId);
  console.log('Current user:', user);

  // Find program from mock data
  const initialProgram = mockPrograms.find(p => p.taskId === Number(taskId));
  
  useEffect(() => {
    console.log('StationAssignment useEffect running');
    // Simulate loading time to ensure proper initialization
    const timer = setTimeout(() => {
      console.log('Setting loading to false');
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    console.log('Still loading...');
    return (
      <AppLayout currentRoute="/station-assignment">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">טוען משימה...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

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

  console.log('Program found:', initialProgram.title, 'Status:', initialProgram.status);

  const [program, setProgram] = useState<Program>({
    ...initialProgram,
    requiredQuarter: initialProgram.requiredQuarter ? new Date(initialProgram.requiredQuarter) : null,
    startDate: initialProgram.startDate ? new Date(initialProgram.startDate) : null,
    lastUpdate: initialProgram.lastUpdate ? new Date(initialProgram.lastUpdate) : new Date(),
    createdAt: initialProgram.createdAt ? new Date(initialProgram.createdAt) : new Date(),
    stations: initialProgram.stations?.map((station: any) => ({
      ...station,
      completionDate: station.completionDate ? new Date(station.completionDate) : null,
      lastUpdate: station.lastUpdate ? new Date(station.lastUpdate) : new Date()
    })) || []
  });

  const handleBack = () => {
    console.log('Navigating back to dashboard');
    navigate('/');
  };

  const handleSave = () => {
    console.log('Saving task changes');
    toast({
      title: "שינויים נשמרו",
      description: "פרטי המשימה נשמרו בהצלחה",
    });
  };

  const handleFreeze = () => {
    console.log('Freezing task');
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
    console.log('Program updated:', updatedProgram.title);
    setProgram(updatedProgram);
  };

  // Check permissions based on user role and task status
  const getPermissions = () => {
    const roleCode = user?.roleCode;
    const status = program.status;

    console.log('Checking permissions for role:', roleCode, 'status:', status);

    // גורם דורש
    if (roleCode === 4) {
      if (status === 'Open') {
        // גורם דורש can edit in Open status (should redirect to new task form)
        return {
          canEdit: true,
          canSave: true,
          canFreeze: false,
          isReadOnly: false
        };
      }
      return {
        canEdit: false,
        canSave: false,
        canFreeze: false,
        isReadOnly: true
      };
    }

    // מנהל רכש
    if (roleCode === 1) {
      return {
        canEdit: true,
        canSave: true,
        canFreeze: status === 'Open',
        isReadOnly: false
      };
    }

    // ראש צוות
    if (roleCode === 2) {
      if (status === 'Plan' || status === 'In Progress') {
        return {
          canEdit: true,
          canSave: true,
          canFreeze: false,
          isReadOnly: false
        };
      }
      if (status === 'Complete') {
        // Check close permissions from system settings
        const closePermissions = 'Team Leader'; // This should come from system settings
        return {
          canEdit: closePermissions === 'Team Leader',
          canSave: closePermissions === 'Team Leader',
          canFreeze: false,
          isReadOnly: closePermissions !== 'Team Leader'
        };
      }
      return {
        canEdit: false,
        canSave: false,
        canFreeze: false,
        isReadOnly: true
      };
    }

    // קניין
    if (roleCode === 3) {
      if (status === 'Plan' || status === 'In Progress') {
        return {
          canEdit: true,
          canSave: true,
          canFreeze: false,
          isReadOnly: false
        };
      }
      return {
        canEdit: false,
        canSave: false,
        canFreeze: false,
        isReadOnly: true
      };
    }

    // Default - read only
    return {
      canEdit: false,
      canSave: false,
      canFreeze: false,
      isReadOnly: true
    };
  };

  const permissions = getPermissions();
  console.log('Calculated permissions:', permissions);

  // Show permission dialog instead of blocking access
  const handlePermissionDenied = () => {
    setShowPermissionDialog(true);
  };

  console.log('Rendering StationAssignment component');

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
              {permissions.canSave && (
                <Button onClick={handleSave} className="flex items-center gap-2 text-sm px-3 py-1.5">
                  <Save className="w-3 h-3" />
                  שמירה
                </Button>
              )}
              {permissions.canFreeze && (
                <Button onClick={handleFreeze} variant="secondary" className="flex items-center gap-2 text-sm px-3 py-1.5">
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