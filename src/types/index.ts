// Status types with Hebrew labels and colors
export type TaskStatus = 'Open' | 'Plan' | 'In Progress' | 'Complete' | 'Done' | 'Freeze' | 'Cancel';

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  'Open': { label: 'פתוח', color: '#000', bgColor: '#FED8B1' },
  'Plan': { label: 'תכנון', color: '#000', bgColor: '#B5E6FC' },
  'In Progress': { label: 'בביצוע', color: '#000', bgColor: '#FFFDD0' },
  'Complete': { label: 'הושלם', color: '#000', bgColor: '#BCF5BC' },
  'Done': { label: 'סגור', color: '#000', bgColor: '#C5E28A' },
  'Freeze': { label: 'הקפאה', color: '#000', bgColor: '#E1E1E1' },
  'Cancel': { label: 'ביטול', color: '#000', bgColor: '#E1E1E1' }
};

// User roles - הוספת התפקיד הטכני
export type UserRole = 'procurement_manager' | 'team_leader' | 'procurement_officer' | 'requester' | 'admin' | 'technical_maintainer';

export const USER_ROLES: Record<UserRole, string> = {
  'procurement_manager': 'מנהל רכש',
  'team_leader': 'ראש צוות',
  'procurement_officer': 'קניין',
  'requester': 'גורם דורש',
  'admin': 'מנהלן מערכת',
  'technical_maintainer': 'גורם טכני'
};

// Infrastructure tables types
export interface OrganizationalRole {
  id: number;
  roleCode: number; // 0-6
  description: string;
  permissions?: string;
}

export interface StatusValue {
  id: number;
  open: string;
  plan: string;
  inProgress: string;
  complete: string;
  done: string;
  freeze: string;
  cancel: string;
}

export interface StructureValue {
  id: number;
  division: string;
  department: string;
  team: string;
}

export type AssignPermissions = 'Manager only' | 'Team leader';
export type ClosePermissions = 'Automatic' | 'Manager only' | 'Team leader';

export interface Permissions {
  id: number;
  assignPermissions: AssignPermissions;
  closePermissions: ClosePermissions;
}

// Currency types
export type Currency = 'ILS' | 'USD' | 'EUR' | 'GBP';

export const CURRENCY_CONFIG: Record<Currency, string> = {
  'ILS': 'שקל',
  'USD': 'דולר',
  'EUR': 'יורו',
  'GBP': 'ליש"ט'
};

// Planning source types
export type PlanningSource = 'annual_planning' | 'unplanned' | 'carried_over';

export const PLANNING_SOURCE_CONFIG: Record<PlanningSource, string> = {
  'annual_planning': 'תכנון שנתי',
  'unplanned': 'בלתי מתוכנן',
  'carried_over': 'נגרר בין שנים'
};

// Task complexity levels
export type ComplexityLevel = 1 | 2 | 3;

// Activity Pool entity
export interface ActivityPool {
  id: number;
  name: string;
  toolsAndResources?: string;
}

// Engagement Type entity
export interface EngagementType {
  id: number;
  name: string;
}

// Program Task entity (תחנות)
export interface ProgramTask {
  programId: number;
  stationId: number;
  activityId?: number;
  activity?: {
    id: number;
    name: string;
  };
  assignedOfficerId?: number;
  assignedOfficerName?: string;
  completionDate?: Date | null;
  reportingUserId?: number;
  reportingUserName?: string;
  reference?: string;
  notes?: string;
  isLastStation: boolean;
  lastUpdate: Date;
}

// Program entity (משימת עבודה ראשית)
export interface Program {
  taskId: number;
  workYear: number;
  requiredQuarter: Date | null;
  title: string;
  description?: string;
  requesterId: number;
  requesterName: string;
  divisionId: number;
  divisionName: string;
  departmentId?: number;
  departmentName?: string;
  domainId?: number;
  domainName?: string;
  estimatedAmount?: number;
  currency?: Currency;
  supplierList?: string;
  justification?: string;
  planningSource: PlanningSource;
  complexity?: ComplexityLevel;
  engagementTypeId?: number;
  engagementTypeName?: string;
  status: TaskStatus;
  assignedOfficerId?: number;
  assignedOfficerName?: string;
  teamId?: number;
  teamName?: string;
  startDate?: Date | null;
  planningNotes?: string;
  officerNotes?: string;
  lastUpdate: Date;
  createdAt: Date;
  // Virtual fields for UI
  stations?: ProgramTask[];
  // Legacy fields for backward compatibility
  requesterDepartment?: string;
  domain?: string;
  assignedOfficer?: string;
  requiredDate?: Date | null;
  plannedDays?: number;
  actualDays?: number;
  completionDate?: Date | null;
}

// User entity
export interface User {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
  division?: string;
  teamId?: string;
  workDaysAvailable?: number;
}

// Navigation menu item
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  roles: UserRole[];
  route: string;
}

// Export current user and mock programs for easy access
export { currentUser, mockPrograms } from '../data/mockData';