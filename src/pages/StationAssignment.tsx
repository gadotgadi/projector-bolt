import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Program, STATUS_CONFIG } from '../types';
import { Button } from '../components/ui/button';
import { ArrowRight, Save, Lock, ChevronDown } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import ProgramForm from '../components/program/ProgramForm';
import StationAssignmentForm from '../components/stations/StationAssignmentForm';
import StatusBadge from '../components/common/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { mockPrograms } from '../data/mockPrograms';
import { useAuth } from '../components/auth/AuthProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

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

  const handleStatusChange = (newStatus: string) => {
    const updatedProgram = {
      ...program,
      status: newStatus as any,
      lastUpdate: new Date()
    };
    setProgram(updatedProgram);
    
    toast({
      title: "סטטוס עודכן",
      description: `סטטוס המשימה שונה ל-${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.label}`,
    });
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
      canFreeze: getFreezePermission(roleCode, status),
      canEditStatus: getStatusEditPermission(roleCode, status)
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
    // Don't show save button for certain statuses and roles
    if (['Done', 'Cancel'].includes(status || '')) return false;
    if (roleCode === 4) return false; // גורם דורש
    if (roleCode === 2 && status === 'Complete') {
      const closePermissions = 'Team leader'; // Mock value
      return closePermissions === 'Team leader';
    }
    if ([3].includes(roleCode || 0) && ['Complete', 'Freeze'].includes(status || '')) return false;
    
    return getEditPermission(roleCode, status);
  };

  const getFreezePermission = (roleCode?: number, status?: string) => {
    // Only מנהל רכש can freeze, and only in Open status
    return roleCode === 1 && status === 'Open';
  };

  const getStatusEditPermission = (roleCode?: number, status?: string) => {
    // Only מנהל רכש can edit status manually
    if (roleCode !== 1) return false;
    
    // Different statuses allow different transitions
    const allowedTransitions: Record<string, string[]> = {
      'Complete': ['Done', 'Freeze', 'Cancel'],
      'In Progress': ['Freeze', 'Cancel'],
      'Plan': ['Freeze', 'Cancel'],
      'Open': ['Freeze', 'Cancel'],
      'Freeze': ['Cancel', 'Open', 'Plan', 'In Progress', 'Done', 'Complete']
    };
    
    return allowedTransitions[status || '']?.length > 0;
  };

  const getAvailableStatusOptions = () => {
    const status = program.status;
    const allowedTransitions: Record<string, string[]> = {
      'Complete': ['Done', 'Freeze', 'Cancel'],
      'In Progress': ['Freeze', 'Cancel'],
      'Plan': ['Freeze', 'Cancel'],
      'Open': ['Freeze', 'Cancel'],
      'Freeze': ['Cancel', 'Open', 'Plan', 'In Progress', 'Done', 'Complete']
    };
    
    return allowedTransitions[status] || [];
  };

  const permissions = getUserPermissions();

  // Check if user should be redirected to new task form
  if (user?.roleCode === 4 && program.status === 'Open') {
    // Redirect to new task form for גורם דורש in Open status
    navigate(`/new-task?taskId=${program.taskId}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Single Header with everything - NO AppLayout wrapper */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Right side - Title and Action buttons */}
          <div className="flex items-center gap-6">
            <div className="text-xl font-bold text-gray-900">
              טיפול במשימה #{program.taskId}
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2 px-4 py-2">
                <ArrowRight className="w-4 h-4" />
                חזרה
              </Button>
              
              {permissions.canSave && (
                <Button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 text-lg font-medium">
                  <Save className="w-5 h-5" />
                  שמור
                </Button>
              )}
              
              {permissions.canFreeze && (
                <Button onClick={handleFreeze} variant="secondary" className="flex items-center gap-2 px-6 py-3 text-lg font-medium">
                  <Lock className="w-5 h-5" />
                  קיבוע
                </Button>
              )}
            </div>
          </div>
          
          {/* Left side - Year selector and user name */}
          <div className="flex items-center gap-4">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
            <span className="font-medium text-gray-800">{user?.fullName}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex p-6 gap-6">
        {/* Right Side - Program Details (2/3 width) */}
        <div className="w-2/3 bg-white rounded-lg border p-6">
          <ProgramForm 
            program={program}
            canEdit={permissions.canEdit}
            onProgramUpdate={handleProgramUpdate}
            isEditing={false}
            onSave={handleSave}
            onCancel={() => {}}
          />
        </div>

        {/* Left Side - Station Assignment (1/3 width) */}
        <div className="w-1/3 space-y-4">
          {/* Status and Last Update */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              {/* Status Badge with dropdown if editable */}
              <div className="flex items-center">
                {permissions.canEditStatus ? (
                  <Select value={program.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 bg-transparent">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={program.status} size="lg" />
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={program.status}>
                        {STATUS_CONFIG[program.status].label} (נוכחי)
                      </SelectItem>
                      {getAvailableStatusOptions().map(status => (
                        <SelectItem key={status} value={status}>
                          {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusBadge status={program.status} size="lg" />
                )}
              </div>
              
              {/* Last Update */}
              <div className="text-left">
                <div className="text-sm font-medium text-gray-700 mb-1">עדכון אחרון</div>
                <div className="text-sm text-gray-600">
                  {program.lastUpdate ? program.lastUpdate.toLocaleDateString('he-IL') : 'לא עודכן'}
                </div>
              </div>
            </div>
          </div>

          {/* Station Assignment */}
          <div className="bg-white rounded-lg border p-4">
            <StationAssignmentForm 
              program={program}
              canEdit={permissions.canEdit}
              onSave={handleSave}
              onProgramUpdate={handleProgramUpdate}
            />
          </div>
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
  );
};

export default StationAssignment;