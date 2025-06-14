
import React, { useState } from 'react';
import { Program, ProgramTask, currentUser } from '../../types';
import { CheckCircle, Circle, Clock, Save, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';

interface StationsProgressProps {
  program: Program;
  onProgramUpdate?: (program: Program) => void;
}

// Mock data for activities and officers
const mockActivities = [
  { id: 1, name: 'בדיקת דרישות' },
  { id: 2, name: 'אישור תקנון' },
  { id: 3, name: 'הכנת מכרז' },
  { id: 4, name: 'פרסום מכרז' },
  { id: 5, name: 'בחינת הצעות' },
  { id: 6, name: 'בחירת זוכה' },
  { id: 7, name: 'הכנת חוזה' },
  { id: 8, name: 'חתימה על חוזה' },
  { id: 9, name: 'מעקב ביצוע' },
  { id: 10, name: 'סיום פרויקט' }
];

const mockOfficers = [
  { id: 1, name: 'יוסי כהן' },
  { id: 2, name: 'דנה לוי' },
  { id: 3, name: 'אבי שמואל' },
  { id: 4, name: 'רות ישראל' }
];

const StationsProgress: React.FC<StationsProgressProps> = ({ program, onProgramUpdate }) => {
  const [stations, setStations] = useState<ProgramTask[]>(program.stations || []);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const maxStations = 10;
  
  // Determine mode based on user role and program status
  const canAssign = (currentUser.role === 'procurement_manager' || currentUser.role === 'team_leader') && 
                   ['Open', 'Plan'].includes(program.status);
  
  const canReportProgress = (currentUser.role === 'procurement_officer' || 
                           currentUser.role === 'procurement_manager' || 
                           currentUser.role === 'team_leader') &&
                          ['In Progress', 'Complete'].includes(program.status);

  const handleActivityChange = (stationId: number, activityId: number) => {
    const activity = mockActivities.find(a => a.id === activityId);
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
        isLastStation: stationId === maxStations,
        lastUpdate: new Date()
      });
    }
    
    setStations(updatedStations);
    setHasChanges(true);
  };

  const handleOfficerChange = (stationId: number, officerId: number) => {
    const officer = mockOfficers.find(o => o.id === officerId);
    const updatedStations = [...stations];
    const existingStationIndex = updatedStations.findIndex(s => s.stationId === stationId);
    
    if (existingStationIndex >= 0) {
      updatedStations[existingStationIndex] = {
        ...updatedStations[existingStationIndex],
        assignedOfficerId: officerId,
        assignedOfficerName: officer?.name,
        lastUpdate: new Date()
      };
    } else {
      updatedStations.push({
        programId: program.taskId,
        stationId,
        assignedOfficerId: officerId,
        assignedOfficerName: officer?.name,
        isLastStation: stationId === maxStations,
        lastUpdate: new Date()
      });
    }
    
    setStations(updatedStations);
    setHasChanges(true);
  };

  const handleCompletionDateChange = (stationId: number, dateValue: string) => {
    const updatedStations = [...stations];
    const existingStationIndex = updatedStations.findIndex(s => s.stationId === stationId);
    
    if (existingStationIndex >= 0) {
      updatedStations[existingStationIndex] = {
        ...updatedStations[existingStationIndex],
        completionDate: dateValue ? new Date(dateValue) : undefined,
        lastUpdate: new Date()
      };
      
      setStations(updatedStations);
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    if (onProgramUpdate) {
      const updatedProgram = {
        ...program,
        stations,
        lastUpdate: new Date()
      };
      onProgramUpdate(updatedProgram);
      setHasChanges(false);
      
      toast({
        title: "השינויים נשמרו",
        description: "שיבוץ התחנות עודכן בהצלחה",
      });
    }
  };

  const getStationStatus = (stationId: number) => {
    const station = stations.find(s => s.stationId === stationId);
    if (!station) return 'empty';
    if (station.completionDate) return 'completed';
    if (station.activityId) return 'assigned';
    return 'empty';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 border-green-300';
      case 'assigned': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'assigned': return <Clock className="w-5 h-5 text-blue-600" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-right">
          {canAssign ? 'שיבוץ פעילויות לתחנות' : 'התקדמות תחנות'}
        </h3>
        {hasChanges && (
          <Button onClick={handleSave} size="sm" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            שמור שינויים
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        {Array.from({ length: maxStations }, (_, index) => {
          const stationNumber = index + 1;
          const station = stations.find(s => s.stationId === stationNumber);
          const status = getStationStatus(stationNumber);
          
          return (
            <div key={stationNumber} className={`p-4 rounded-lg border-2 ${getStatusColor(status)}`}>
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(status)}
                <div className="flex-1 text-right">
                  <div className="font-bold text-lg">תחנה {stationNumber}</div>
                </div>
              </div>

              {/* Assignment Mode - for procurement managers */}
              {canAssign && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">פעילות</Label>
                    <select 
                      value={station?.activityId || ''}
                      onChange={(e) => handleActivityChange(stationNumber, Number(e.target.value))}
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">בחר פעילות</option>
                      {mockActivities.map(activity => (
                        <option key={activity.id} value={activity.id}>
                          {activity.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      קניין מטפל
                    </Label>
                    <select 
                      value={station?.assignedOfficerId || ''}
                      onChange={(e) => handleOfficerChange(stationNumber, Number(e.target.value))}
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">בחר קניין</option>
                      {mockOfficers.map(officer => (
                        <option key={officer.id} value={officer.id}>
                          {officer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Progress Reporting Mode - for officers */}
              {canReportProgress && station?.activityId && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-700">
                    <strong>פעילות:</strong> {station.activity?.name}
                  </div>
                  {station.assignedOfficerName && (
                    <div className="text-sm text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <strong>מטפל:</strong> {station.assignedOfficerName}
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">תאריך השלמה</Label>
                    <Input 
                      type="date"
                      value={station.completionDate ? station.completionDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleCompletionDateChange(stationNumber, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  {station.completionDate && (
                    <div className="text-xs text-green-600">
                      הושלם: {station.completionDate.toLocaleDateString('he-IL')}
                    </div>
                  )}
                </div>
              )}

              {/* Read-only mode for other users/statuses */}
              {!canAssign && !canReportProgress && station && (
                <div className="space-y-2">
                  {station.activity && (
                    <div className="text-sm text-gray-700">
                      <strong>פעילות:</strong> {station.activity.name}
                    </div>
                  )}
                  {station.assignedOfficerName && (
                    <div className="text-sm text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <strong>מטפל:</strong> {station.assignedOfficerName}
                    </div>
                  )}
                  {station.completionDate && (
                    <div className="text-xs text-green-600">
                      הושלם: {station.completionDate.toLocaleDateString('he-IL')}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {stations.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-right">
          מוגדרות {stations.filter(s => s.activityId).length} תחנות | 
          הושלמו {stations.filter(s => s.completionDate).length} תחנות
        </div>
      )}
    </div>
  );
};

export default StationsProgress;
