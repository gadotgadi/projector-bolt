import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Plus, Save, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EngagementTypeWithProcess } from '../types/engagementTypes';
import { mockActivityPool } from '../data/mockData';
import { Alert, AlertDescription } from '../components/ui/alert';

// Mock data for engagement types with processes
const mockEngagementTypesData: EngagementTypeWithProcess[] = [
  {
    id: 1,
    name: 'מכרז פומבי',
    processes: [
      { engagementTypeId: 1, stationId: 1, activityId: 1 },
      { engagementTypeId: 1, stationId: 2, activityId: 2 },
      { engagementTypeId: 1, stationId: 3, activityId: 3 },
      { engagementTypeId: 1, stationId: 4, activityId: 4 },
      { engagementTypeId: 1, stationId: 5, activityId: 6 },
      { engagementTypeId: 1, stationId: 6, activityId: 7 },
      { engagementTypeId: 1, stationId: 7, activityId: 8 },
      { engagementTypeId: 1, stationId: 8, activityId: 9 },
      { engagementTypeId: 1, stationId: 9, activityId: 10 },
      { engagementTypeId: 1, stationId: 10, activityId: 11 }
    ]
  },
  {
    id: 2,
    name: 'מכרז מוגבל',
    processes: [
      { engagementTypeId: 2, stationId: 1, activityId: 1 },
      { engagementTypeId: 2, stationId: 2, activityId: 2 },
      { engagementTypeId: 2, stationId: 3, activityId: 5 },
      { engagementTypeId: 2, stationId: 4, activityId: 10 },
      { engagementTypeId: 2, stationId: 5, activityId: 11 }
    ]
  },
  {
    id: 3,
    name: 'מכרז פתוח מוגבל',
    processes: [
      { engagementTypeId: 3, stationId: 1, activityId: 1 },
      { engagementTypeId: 3, stationId: 2, activityId: 2 },
      { engagementTypeId: 3, stationId: 3, activityId: 5 },
      { engagementTypeId: 3, stationId: 4, activityId: 11 }
    ]
  },
  {
    id: 4,
    name: 'רכש השוואתי',
    processes: [
      { engagementTypeId: 4, stationId: 1, activityId: 1 },
      { engagementTypeId: 4, stationId: 2, activityId: 2 },
      { engagementTypeId: 4, stationId: 3, activityId: 5 }
    ]
  }
];

const EngagementTypes = () => {
  const [engagementTypes, setEngagementTypes] = useState<EngagementTypeWithProcess[]>(mockEngagementTypesData);
  const [newTypeName, setNewTypeName] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const validateEngagementTypes = () => {
    const errors: string[] = [];

    engagementTypes.forEach(type => {
      // Check minimum 2 stations
      if (type.processes.length < 2) {
        errors.push(`סוג התקשרות "${type.name}" חייב להכיל לפחות 2 תחנות`);
        return;
      }

      // Check for gaps in station sequence
      const sortedStations = type.processes
        .map(p => p.stationId)
        .sort((a, b) => a - b);
      
      for (let i = 1; i < sortedStations.length; i++) {
        if (sortedStations[i] - sortedStations[i-1] > 1) {
          errors.push(`סוג התקשרות "${type.name}" חסר תחנות ברצף - לא ניתן לדלג על תחנות`);
          break;
        }
      }

      // Check for duplicate activities
      const activityIds = type.processes.map(p => p.activityId);
      const uniqueActivityIds = new Set(activityIds);
      if (activityIds.length !== uniqueActivityIds.size) {
        errors.push(`סוג התקשרות "${type.name}" מכיל פעילויות כפולות`);
      }
    });

    return errors;
  };

  const handleAddNewType = () => {
    if (!newTypeName.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין שם לסוג ההתקשרות החדש",
        variant: "destructive"
      });
      return;
    }
    
    const newId = Math.max(...engagementTypes.map(et => et.id)) + 1;
    const newType: EngagementTypeWithProcess = {
      id: newId,
      name: newTypeName,
      processes: [] // עמודה חדשה עם 10 שורות ריקות
    };
    
    setEngagementTypes(prev => [...prev, newType]);
    setNewTypeName('');
    setValidationErrors([]);
    
    toast({
      title: "נוצר בהצלחה",
      description: `סוג התקשרות חדש "${newTypeName}" נוסף עם 10 תחנות ריקות`,
    });
  };

  const handleDeleteType = (typeId: number) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק סוג התקשרות זה?')) {
      setEngagementTypes(prev => prev.filter(et => et.id !== typeId));
      setValidationErrors([]);
      
      toast({
        title: "נמחק בהצלחה",
        description: "סוג ההתקשרות הוסר",
      });
    }
  };

  const handleStationActivityChange = (typeId: number, stationId: number, activityId: number | null) => {
    setEngagementTypes(prev => prev.map(type => {
      if (type.id !== typeId) return type;
      
      const updatedProcesses = [...type.processes];
      const existingProcessIndex = updatedProcesses.findIndex(p => p.stationId === stationId);
      
      if (activityId === null) {
        // Remove the process
        if (existingProcessIndex >= 0) {
          updatedProcesses.splice(existingProcessIndex, 1);
        }
      } else {
        // Check if activity is already used in another station for this type
        const isActivityUsed = updatedProcesses.some(p => p.activityId === activityId && p.stationId !== stationId);
        if (isActivityUsed) {
          toast({
            title: "שגיאה",
            description: "פעילות זו כבר שובצה לתחנה אחרת באותו סוג התקשרות",
            variant: "destructive"
          });
          return type;
        }
        
        if (existingProcessIndex >= 0) {
          // Update existing process
          updatedProcesses[existingProcessIndex].activityId = activityId;
        } else {
          // Add new process
          updatedProcesses.push({
            engagementTypeId: typeId,
            stationId,
            activityId
          });
        }
      }
      
      return {
        ...type,
        processes: updatedProcesses
      };
    }));

    // Clear validation errors when user makes changes
    setValidationErrors([]);
  };

  const handleSaveAll = () => {
    const errors = validateEngagementTypes();
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "שגיאות בהגדרות",
        description: "נא לתקן את השגיאות המוצגות",
        variant: "destructive"
      });
      return;
    }

    setValidationErrors([]);
    toast({
      title: "נשמר בהצלחה",
      description: "כל סוגי ההתקשרויות עודכנו",
    });
  };

  const getActivityForTypeAndStation = (typeId: number, stationId: number) => {
    const type = engagementTypes.find(t => t.id === typeId);
    const process = type?.processes.find(p => p.stationId === stationId);
    return process?.activityId || null;
  };

  const getUsedActivitiesForType = (typeId: number) => {
    const type = engagementTypes.find(t => t.id === typeId);
    return type?.processes.map(p => p.activityId) || [];
  };

  const getActivityName = (activityId: number | null) => {
    if (!activityId) return null;
    const activity = mockActivityPool.find(a => a.id === activityId);
    return activity?.name || null;
  };

  return (
    <AppLayout currentRoute="/engagement-types">
      <div className="space-y-6">
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="text-right">
                <strong>שגיאות בהגדרות:</strong>
                <ul className="mt-2 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <Button onClick={handleSaveAll}>
                <Save className="w-4 h-4 ml-2" />
                שמור הכל
              </Button>
              <div className="flex gap-2">
                <Input
                  placeholder="שם סוג חדש"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="text-right w-48"
                  maxLength={15}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddNewType();
                    }
                  }}
                />
                <Button onClick={handleAddNewType} size="sm">
                  <Plus className="w-4 h-4 ml-1" />
                  חדש
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="min-w-fit">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center font-bold sticky right-0 bg-white z-10 border-l">תחנה</TableHead>
                      {engagementTypes.map(type => (
                        <TableHead key={type.id} className="text-center min-w-48">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteType(type.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <span className="font-bold">{type.name}</span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 10 }, (_, index) => {
                      const stationId = index + 1;
                      return (
                        <TableRow key={stationId}>
                          <TableCell className="text-center font-medium bg-gray-50 sticky right-0 z-10 border-l">
                            {stationId}
                          </TableCell>
                          {engagementTypes.map(type => {
                            const currentActivityId = getActivityForTypeAndStation(type.id, stationId);
                            const usedActivities = getUsedActivitiesForType(type.id);
                            const availableActivities = mockActivityPool.filter(
                              activity => !usedActivities.includes(activity.id) || currentActivityId === activity.id
                            );
                            const activityName = getActivityName(currentActivityId);

                            return (
                              <TableCell key={type.id} className="p-2 min-w-48">
                                <Select
                                  value={currentActivityId?.toString() || 'none'}
                                  onValueChange={(value) => 
                                    handleStationActivityChange(type.id, stationId, value === 'none' ? null : Number(value))
                                  }
                                >
                                  <SelectTrigger className="text-right text-sm">
                                    <SelectValue>
                                      {activityName ? (
                                        <span className="text-black font-medium">{activityName}</span>
                                      ) : (
                                        <span className="text-gray-500">ריק</span>
                                      )}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">
                                      <span className="text-gray-500">ריק</span>
                                    </SelectItem>
                                    {availableActivities.map(activity => (
                                      <SelectItem key={activity.id} value={activity.id.toString()}>
                                        <span className="text-black">{activity.name}</span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default EngagementTypes;