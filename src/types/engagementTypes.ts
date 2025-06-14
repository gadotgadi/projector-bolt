
// Engagement Type entity
export interface EngagementTypeDefinition {
  id: number;
  name: string;
}

// Engagement Type Process entity - defines which activities go to which stations
export interface EngagementTypeProcess {
  engagementTypeId: number;
  stationId: number; // 1-10
  activityId: number; // reference to Activity Pool
}

// Combined view for easier management
export interface EngagementTypeWithProcess extends EngagementTypeDefinition {
  processes: EngagementTypeProcess[];
}
