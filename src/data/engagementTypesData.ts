
import { EngagementTypeDefinition, EngagementTypeProcess } from '../types/engagementTypes';

// Mock engagement type definitions
export const mockEngagementTypes: EngagementTypeDefinition[] = [
  { id: 1, name: 'מכרז פומבי' },
  { id: 2, name: 'ספק יחיד' },
  { id: 3, name: 'הזמנה קטנה' }
];

// Mock engagement type processes - defines which activities go to which stations for each engagement type
export const mockEngagementTypeProcesses: EngagementTypeProcess[] = [
  // מכרז פומבי
  { engagementTypeId: 1, stationId: 1, activityId: 1 }, // איסוף דרישות
  { engagementTypeId: 1, stationId: 2, activityId: 2 }, // ניתוח שוק
  { engagementTypeId: 1, stationId: 3, activityId: 3 }, // הכנת מפרט
  { engagementTypeId: 1, stationId: 4, activityId: 4 }, // פרסום מכרז
  { engagementTypeId: 1, stationId: 5, activityId: 5 }, // הערכת הצעות
  { engagementTypeId: 1, stationId: 6, activityId: 6 }, // בחירת זוכה
  { engagementTypeId: 1, stationId: 7, activityId: 7 }, // חתימת חוזה
  
  // ספק יחיד
  { engagementTypeId: 2, stationId: 1, activityId: 1 }, // איסוף דרישות
  { engagementTypeId: 2, stationId: 2, activityId: 8 }, // זיהוי ספק
  { engagementTypeId: 2, stationId: 3, activityId: 9 }, // משא ומתן
  { engagementTypeId: 2, stationId: 4, activityId: 7 }, // חתימת חוזה
  
  // הזמנה קטנה
  { engagementTypeId: 3, stationId: 1, activityId: 1 }, // איסוף דרישות
  { engagementTypeId: 3, stationId: 2, activityId: 10 }, // הזמנת הצעות
  { engagementTypeId: 3, stationId: 3, activityId: 6 }, // בחירת זוכה
];

// Helper function to get processes for a specific engagement type
export const getProcessesForEngagementType = (engagementTypeId: number): EngagementTypeProcess[] => {
  return mockEngagementTypeProcesses.filter(process => process.engagementTypeId === engagementTypeId);
};
