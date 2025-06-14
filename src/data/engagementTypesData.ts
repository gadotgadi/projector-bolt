import { EngagementTypeWithProcess } from '../types/engagementTypes';

// Mock engagement types with their processes
export const mockEngagementTypes: EngagementTypeWithProcess[] = [
  {
    id: 1,
    name: 'מכרז פומבי',
    processes: [
      { engagementTypeId: 1, stationId: 1, activityId: 1 },
      { engagementTypeId: 1, stationId: 2, activityId: 2 },
      { engagementTypeId: 1, stationId: 3, activityId: 3 },
      { engagementTypeId: 1, stationId: 4, activityId: 4 },
      { engagementTypeId: 1, stationId: 5, activityId: 5 },
      { engagementTypeId: 1, stationId: 6, activityId: 6 },
      { engagementTypeId: 1, stationId: 7, activityId: 7 },
      { engagementTypeId: 1, stationId: 8, activityId: 8 },
      { engagementTypeId: 1, stationId: 9, activityId: 9 },
      { engagementTypeId: 1, stationId: 10, activityId: 10 }
    ]
  },
  {
    id: 2,
    name: 'מכרז מוגבל',
    processes: [
      { engagementTypeId: 2, stationId: 1, activityId: 1 },
      { engagementTypeId: 2, stationId: 2, activityId: 2 },
      { engagementTypeId: 2, stationId: 3, activityId: 4 },
      { engagementTypeId: 2, stationId: 4, activityId: 5 },
      { engagementTypeId: 2, stationId: 5, activityId: 6 }
    ]
  },
  {
    id: 3,
    name: 'מכרז פתוח מוגבל',
    processes: [
      { engagementTypeId: 3, stationId: 1, activityId: 1 },
      { engagementTypeId: 3, stationId: 2, activityId: 2 },
      { engagementTypeId: 3, stationId: 3, activityId: 3 },
      { engagementTypeId: 3, stationId: 4, activityId: 5 }
    ]
  },
  {
    id: 4,
    name: 'רכש השוואתי',
    processes: [
      { engagementTypeId: 4, stationId: 1, activityId: 1 },
      { engagementTypeId: 4, stationId: 2, activityId: 5 },
      { engagementTypeId: 4, stationId: 3, activityId: 6 }
    ]
  }
];

// Helper function to get processes for a specific engagement type
export const getProcessesForEngagementType = (engagementTypeId: number) => {
  const engagementType = mockEngagementTypes.find(et => et.id === engagementTypeId);
  return engagementType ? engagementType.processes : [];
};

// Helper function to get engagement type by ID
export const getEngagementTypeById = (id: number) => {
  return mockEngagementTypes.find(et => et.id === id);
};