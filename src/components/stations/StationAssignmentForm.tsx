import React, { useState } from 'react';
import { Program, ProgramTask } from '../../types';
import { ChevronDown, Calendar, MessageSquare } from 'lucide-react';
import { mockActivityPool } from '../../data/mockData';
import { mockEngagementTypes, getProcessesForEngagementType } from '../../data/engagementTypesData';
import { useToast } from '../ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { useAuth } from '../auth/AuthProvider';

interface StationAssignmentFormProps {
  program: Program;
  canEdit: boolean;
  onSave: () => void;
  onProgramUpdate: (updatedProgram: Program) => void;
}

const StationAssignmentForm: React.FC<StationAssignmentFormProps> = ({ 
  program, 
  canEdit, 
  onSave,
  onProgramUpdate
}) => {
  const [stations, setStations] = useState<ProgramTask[]>(program.stations || []);
  const [selectedEngagementTypeId, setSelectedEngagementTypeId] = useState<number | null>(
    program.engagementTypeId || null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [stationReference, setStationReference] = useState('');
  const [stationNotes, setStationNotes] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleEngagementTypeChange = (engagementTypeId: number) => {
    if (!canEdit || !['Open', 'Plan'].includes(program.status)) return;
    
    setSelectedEngagementTypeId(engagementTypeId);
    
    // Get processes for selected engagement type
    const processes = getProcessesForEngagementType(engagementTypeId);
    
    // Create new stations based on the engagement type processes
    const newStations: ProgramTask[] = processes.map(process => {
      const activity = mockActivityPool.find(a => a.id === process.activityId);
      return {
        programId: program.taskId,
        stationId: process.stationId,
        activityId: process.activityId,
        activity,
        isLastStation: process.stationId === 10,
        lastUpdate: new Date()
      };
    });
    
    setStations(newStations);
    
    // Update the program with new stations and engagement type
    const selectedEngagementType = mockEngagementTypes.find(et => et.id === engagementTypeId);
    const updatedProgram = {
      ...program,
      engagementTypeId,
      engagementTypeName: selectedEngagementType?.name,
      stations: newStations,
      lastUpdate: new Date()
    };
    onProgramUpdate(updatedProgram);
  };

  const handleActivityChange = (stationId: number, activityId: number) => {
    if (!canEdit || !['Open', 'Plan'].includes(program.status)) return;
    
    const existingAssignment = stations.find(s => s.activityId === activityId && s.stationId !== stationId);
    if (existingAssignment) {
      toast({
        title: "שגיאה",
        description: "פעילות זו כבר שובצה לתחנה אחרת",
        variant: "destructive"
      });
      return;
    }

    const assignedStations = stations.filter(s => s.activityId).map(s => s.stationId).sort((a, b) => a - b);
    const lastAssignedStation = assignedStations.length > 0 ? Math.max(...assignedStations) : 0;
    
    if (stationId > lastAssignedStation + 1) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לדלג על תחנות - יש לשבץ פעילויות ברצף",
        variant: "destructive"
      });
      return;
    }
    
    const activity = mockActivityPool.find(a => a.id === activityId);
    const updatedStations = [...stations];
    const existingStationIndex = updatedStations.findIndex(s => s.stationId === stationId);
    
    if (existingStationIndex >= 0) {
      updatedStations[existingStationIndex] = {
        ...updatedStations[existingStationIndex],
        activityId,
        activity,
        lastUpdate: new Date()
      };
    } else {
      updatedStations.push({
        programId: program.taskId,
        stationId,
        activityId,
        activity,
        isLastStation: stationId === 10,
        lastUpdate: new Date()
      });
    }
    
    setStations(updatedStations);
    
    const updatedProgram = {
      ...program,
      stations: updatedStations,
      lastUpdate: new Date()
    };
    onProgramUpdate(updatedProgram);
  };

  const handleCompletionDateChange = (stationId: number, dateValue: string) => {
    // Validate that the date is not in the future
    if (dateValue) {
      const selectedDate = new Date(dateValue);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      
      if (selectedDate > today) {
        toast({
          title: "שגיאה",
          description: "לא ניתן לבחור תאריך עתידי",
          variant: "destructive"
        });
        return;
      }

      // Validate sequence - can't complete a station if previous station is not completed
      const previousStations = stations
        .filter(s => s.stationId < stationId && s.activityId)
        .sort((a, b) => a.stationId - b.stationId);
      
      if (previousStations.length > 0) {
        const lastPreviousStation = previousStations[previousStations.length - 1];
        if (!lastPreviousStation.completionDate) {
          toast({
            title: "שגיאה",
            description: "לא ניתן להשלים תחנה זו לפני השלמת התחנה הקודמת",
            variant: "destructive"
          });
          return;
        }

        // Check that the date is not earlier than the previous station
        if (selectedDate < lastPreviousStation.completionDate) {
          toast({
            title: "שגיאה",
            description: "תאריך השלמה לא יכול להיות מוקדם מהתחנה הקודמת",
            variant: "destructive"
          });
          return;
        }
      }
    }

    const updatedStations = [...stations];
    const existingStationIndex = updatedStations.findIndex(s => s.stationId === stationId);
    
    if (existingStationIndex >= 0) {
      updatedStations[existingStationIndex] = {
        ...updatedStations[existingStationIndex],
        completionDate: dateValue ? new Date(dateValue) : undefined,
        reportingUserId: dateValue ? Number(user?.id) : undefined,
        reportingUserName: dateValue ? user?.fullName : undefined,
        lastUpdate: new Date()
      };
      
      setStations(updatedStations);
      
      // Update program status based on completion
      const updatedProgram = updateProgramStatus({
        ...program,
        stations: updatedStations,
        lastUpdate: new Date()
      });
      
      onProgramUpdate(updatedProgram);
      
      toast({
        title: "תאריך השלמה עודכן",
        description: `תחנה ${stationId} עודכנה`,
      });
    }
  };

  const updateProgramStatus = (programToUpdate: Program): Program => {
    const completedStations = stations.filter(s => s.completionDate).length;
    const assignedStations = stations.filter(s => s.activityId).length;
    
    let newStatus = programToUpdate.status;
    
    // If we have completed stations and status is still Plan, move to In Progress
    if (completedStations > 0 && programToUpdate.status === 'Plan') {
      newStatus = 'In Progress';
    }
    
    // If all assigned stations are completed, determine final status based on permissions
    if (assignedStations > 0 && completedStations === assignedStations && programToUpdate.status === 'In Progress') {
      // Check close permissions from system settings
      const closePermissions = 'Automatic'; // This should come from system settings
      
      if (closePermissions === 'Automatic') {
        newStatus = 'Done';
      } else if (closePermissions === 'Team Leader' && (user?.roleCode === 2 || user?.roleCode === 1)) {
        newStatus = 'Done';
      } else if (closePermissions === 'Manager only' && user?.roleCode === 1) {
        newStatus = 'Done';
      } else {
        newStatus = 'Complete';
      }
    }
    
    return {
      ...programToUpdate,
      status: newStatus
    };
  };

  const getStationData = (stationId: number) => {
    return stations.find(s => s.stationId === stationId);
  };

  const getCompletedStations = () => {
    return stations
      .filter(s => s.completionDate)
      .sort((a, b) => a.stationId - b.stationId)
      .map(s => s.stationId);
  };

  const getLastCompletedStation = () => {
    const completed = getCompletedStations();
    return completed.length > 0 ? Math.max(...completed) : 0;
  };

  const getNextStationToComplete = () => {
    const lastCompleted = getLastCompletedStation();
    const assignedStations = stations.filter(s => s.activityId).map(s => s.stationId).sort((a, b) => a - b);
    
    // Find the first assigned station that hasn't been completed yet
    for (let stationId of assignedStations) {
      if (stationId > lastCompleted) {
        return stationId;
      }
    }
    return null;
  };

  const getStationStatus = (stationId: number) => {
    const stationData = getStationData(stationId);
    const completedStations = getCompletedStations();
    const lastCompleted = getLastCompletedStation();
    const nextToComplete = getNextStationToComplete();
    
    if (completedStations.includes(stationId)) {
      return { status: 'completed', bgColor: 'bg-green-200', textColor: 'text-black' };
    } else if (stationId === nextToComplete) {
      return { status: 'current', bgColor: 'bg-yellow-100', textColor: 'text-black' };
    } else if (stationData?.activityId) {
      return { status: 'assigned', bgColor: 'bg-blue-100', textColor: 'text-black' };
    } else {
      return { status: 'unassigned', bgColor: 'bg-gray-300', textColor: 'text-black' };
    }
  };

  const canEditCompletionDate = (stationId: number) => {
    if (!canEdit || !['Plan', 'In Progress'].includes(program.status)) return false;
    
    // For Plan status, only first station can be completed
    if (program.status === 'Plan') {
      return stationId === 1 && stations.find(s => s.stationId === 1)?.activityId;
    }
    
    // For In Progress status, can edit last completed station (to fix mistakes) or next station to complete
    const lastCompleted = getLastCompletedStation();
    const nextToComplete = getNextStationToComplete();
    return stationId === lastCompleted || stationId === nextToComplete;
  };

  const shouldShowCalendar = (stationId: number) => {
    return canEditCompletionDate(stationId);
  };

  const canEditActivity = (stationId: number) => {
    if (!canEdit || program.status !== 'Open') return false;
    
    const assignedStations = stations.filter(s => s.activityId).map(s => s.stationId).sort((a, b) => a - b);
    const lastAssignedStation = assignedStations.length > 0 ? Math.max(...assignedStations) : 0;
    return stationId <= lastAssignedStation + 1;
  };

  const getAvailableActivities = (stationId: number) => {
    const currentStationData = getStationData(stationId);
    const assignedActivityIds = stations
      .filter(s => s.activityId && s.stationId !== stationId)
      .map(s => s.activityId);
    
    return mockActivityPool.filter(activity => 
      !assignedActivityIds.includes(activity.id) || 
      (currentStationData && currentStationData.activityId === activity.id)
    );
  };

  const isAssignmentValid = () => {
    const assignedStations = stations.filter(s => s.activityId);
    return assignedStations.length >= 2;
  };

  const validateFreeze = () => {
    if (!isAssignmentValid()) {
      toast({
        title: "שגיאה",
        description: "חובה לשבץ לפחות 2 תחנות לפני קיבוע המשימה",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  React.useEffect(() => {
    window.validateStationAssignment = validateFreeze;
  }, [stations]);

  const handleStationNotesClick = (stationId: number) => {
    const stationData = getStationData(stationId);
    setSelectedStationId(stationId);
    setStationReference(stationData?.reference || '');
    setStationNotes(stationData?.notes || '');
    setDialogOpen(true);
  };

  const handleSaveStationNotes = () => {
    if (selectedStationId) {
      const updatedStations = [...stations];
      const existingStationIndex = updatedStations.findIndex(s => s.stationId === selectedStationId);
      
      if (existingStationIndex >= 0) {
        updatedStations[existingStationIndex] = {
          ...updatedStations[existingStationIndex],
          reference: stationReference,
          notes: stationNotes,
          lastUpdate: new Date()
        };
      } else {
        updatedStations.push({
          programId: program.taskId,
          stationId: selectedStationId,
          reference: stationReference,
          notes: stationNotes,
          isLastStation: selectedStationId === 10,
          lastUpdate: new Date()
        });
      }
      
      setStations(updatedStations);
      
      const updatedProgram = {
        ...program,
        stations: updatedStations,
        lastUpdate: new Date()
      };
      onProgramUpdate(updatedProgram);
      
      toast({
        title: "פרטי תחנה נשמרו",
        description: `תחנה ${selectedStationId} עודכנה`,
      });
    }
    
    setDialogOpen(false);
    setSelectedStationId(null);
    setStationReference('');
    setStationNotes('');
  };

  const handleCancelStationNotes = () => {
    setDialogOpen(false);
    setSelectedStationId(null);
    setStationReference('');
    setStationNotes('');
  };

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const fieldsEditable = canEdit && ['Open', 'Plan'].includes(program.status);

  return (
    <>
      <div className="space-y-4">
        {/* Top fields section - each field in separate row with labels on the right */}
        <div className="bg-white rounded-lg border p-4">
          <div className="space-y-3">
            {/* Engagement Type */}
            <div className="flex items-center gap-3">
              <Label htmlFor="engagement-type-select" className="text-sm font-medium text-gray-700 w-32 text-right flex-shrink-0">סוג התקשרות</Label>
              {fieldsEditable && program.status === 'Open' ? (
                <div className="relative flex-1">
                  <select
                    id="engagement-type-select"
                    value={selectedEngagementTypeId || ''}
                    onChange={(e) => handleEngagementTypeChange(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-white appearance-none pr-8"
                  >
                    <option value="">בחר סוג התקשרות</option>
                    {mockEngagementTypes.map(engagementType => (
                      <option key={engagementType.id} value={engagementType.id}>
                        {engagementType.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              ) : (
                <div className="text-sm text-gray-900 flex-1">
                  {program.engagementTypeName || 'לא הוגדר'}
                </div>
              )}
            </div>
            
            {/* Start Date */}
            <div className="flex items-center gap-3">
              <Label htmlFor="start-date-input" className="text-sm font-medium text-gray-700 w-32 text-right flex-shrink-0">מועד התנעה נדרש</Label>
              {fieldsEditable ? (
                <input
                  id="start-date-input"
                  type="date"
                  value={program.startDate ? program.startDate.toISOString().split('T')[0] : ''}
                  className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 bg-white"
                  readOnly={!fieldsEditable}
                />
              ) : (
                <div className="text-sm text-gray-900 flex-1">
                  {program.startDate ? program.startDate.toLocaleDateString('he-IL') : 'לא הוגדר'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Station Assignment Table */}
        <div className="bg-white rounded-lg border p-4">
          <div className="space-y-1">
            {/* Station rows */}
            {Array.from({ length: 10 }, (_, index) => {
              const stationNumber = index + 1;
              const stationData = getStationData(stationNumber);
              const stationStatus = getStationStatus(stationNumber);
              const availableActivities = getAvailableActivities(stationNumber);
              
              return (
                <div 
                  key={stationNumber} 
                  className={`grid grid-cols-12 gap-2 p-2 rounded ${stationStatus.bgColor} ${stationStatus.textColor}`}
                >
                  {/* Station number - no box, just number */}
                  <div className="col-span-1 text-center font-bold text-sm flex items-center justify-center min-h-[2.5rem]">
                    {stationNumber}
                  </div>
                  
                  {/* Activity name */}
                  <div className="col-span-7 flex items-center">
                    {canEditActivity(stationNumber) ? (
                      <div className="relative w-full">
                        <select
                          value={stationData?.activityId || ''}
                          onChange={(e) => handleActivityChange(stationNumber, Number(e.target.value))}
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-white appearance-none pr-8 min-h-[2.5rem]"
                          aria-label={`פעילות לתחנה ${stationNumber}`}
                        >
                          <option value="">בחר פעילות</option>
                          {availableActivities.map(activity => (
                            <option key={activity.id} value={activity.id}>
                              {activity.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="text-sm break-words leading-tight py-2 px-1 w-full min-h-[2.5rem] flex items-center">
                        {stationData?.activity?.name || ''}
                      </div>
                    )}
                  </div>
                  
                  {/* Completion date */}
                  <div className="col-span-2 flex items-center gap-1 justify-center">
                    {canEditCompletionDate(stationNumber) ? (
                      <input
                        type="date"
                        value={stationData?.completionDate ? stationData.completionDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => handleCompletionDateChange(stationNumber, e.target.value)}
                        max={getTodayDateString()}
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        aria-label={`תאריך השלמה לתחנה ${stationNumber}`}
                      />
                    ) : (
                      <span className="text-sm">
                        {stationData?.completionDate ? stationData.completionDate.toLocaleDateString('he-IL') : ''}
                      </span>
                    )}
                    {shouldShowCalendar(stationNumber) && (
                      <Calendar className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  
                  {/* Reporting user */}
                  <div className="col-span-2 flex items-center gap-1 justify-center">
                    <span className="text-sm">
                      {stationData?.completionDate ? (stationData.reportingUserName || user?.fullName) : ''}
                    </span>
                    <MessageSquare 
                      className="w-4 h-4 text-gray-600 cursor-pointer hover:text-blue-600" 
                      onClick={() => handleStationNotesClick(stationNumber)}
                      aria-label={`הערות לתחנה ${stationNumber}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        
          {/* Assignment status indicator for OPEN status */}
          {program.status === 'Open' && (
            <div className="mt-3 p-2 bg-blue-50 rounded border">
              <div className="text-xs text-blue-800">
                {isAssignmentValid() ? (
                  <span className="text-green-700">✓ שיבוץ התחנות תקין - ניתן לקבע את המשימה</span>
                ) : (
                  <span>יש לשבץ לפחות 2 תחנות לפני קיבוע המשימה</span>
                )}
              </div>
            </div>
          )}

          {/* Progress status indicator for other statuses */}
          {['Plan', 'In Progress'].includes(program.status) && (
            <div className="mt-3 p-2 bg-gray-50 rounded border">
              <div className="text-xs text-gray-700">
                הושלמו {getCompletedStations().length} תחנות מתוך {stations.filter(s => s.activityId).length} תחנות משובצות
                {getNextStationToComplete() && (
                  <span className="mr-2">• התחנה הבאה לביצוע: {getNextStationToComplete()}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Station Notes Dialog */}
      <Dialog open={dialogOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-right">פרטי תחנה {selectedStationId}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="station-reference" className="text-right">סימוכין</Label>
              <Input
                id="station-reference"
                value={stationReference}
                onChange={(e) => setStationReference(e.target.value)}
                className="text-right"
                placeholder="הזן סימוכין"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="station-notes" className="text-right">הערת ביצוע תחנה</Label>
              <Textarea
                id="station-notes"
                value={stationNotes}
                onChange={(e) => setStationNotes(e.target.value)}
                className="text-right min-h-[100px]"
                placeholder="הזן הערות ביצוע"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelStationNotes}>
              ביטול
            </Button>
            <Button onClick={handleSaveStationNotes}>
              שמור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StationAssignmentForm;