// Mock users - one for each role
export interface MockUser {
  id: number;
  employeeId: string;
  fullName: string;
  roleCode: number;
  roleDescription: string;
  procurementTeam?: string;
  email?: string;
  password: string; // For demo purposes
  divisionId?: number;
  departmentId?: number;
}

export const mockUsers: MockUser[] = [
  {
    id: 1,
    employeeId: '9999',
    fullName: 'מנהל מערכת',
    roleCode: 0,
    roleDescription: 'מנהלן מערכת',
    email: 'admin@company.com',
    password: '123456'
  },
  {
    id: 2,
    employeeId: '1001',
    fullName: 'דוד כהן',
    roleCode: 1,
    roleDescription: 'מנהל רכש',
    email: 'david.cohen@company.com',
    password: '123456'
  },
  {
    id: 3,
    employeeId: '2001',
    fullName: 'שרה לוי',
    roleCode: 2,
    roleDescription: 'ראש צוות',
    procurementTeam: 'צוות טכנולוגי',
    email: 'sara.levi@company.com',
    password: '123456'
  },
  {
    id: 4,
    employeeId: '3001',
    fullName: 'אבי כהן',
    roleCode: 3,
    roleDescription: 'קניין',
    procurementTeam: 'צוות לוגיסטי',
    email: 'avi.cohen@company.com',
    password: '123456'
  },
  {
    id: 5,
    employeeId: '4001',
    fullName: 'רחל אברהם',
    roleCode: 4,
    roleDescription: 'גורם דורש',
    email: 'rachel.abraham@company.com',
    password: '123456',
    divisionId: 1, // לוגיסטיקה
    departmentId: 1 // רכש וחוזים
  },
  {
    id: 6,
    employeeId: '5001',
    fullName: 'יוסי לוי',
    roleCode: 5,
    roleDescription: 'מנהל יחידה',
    email: 'yossi.levi@company.com',
    password: '123456',
    divisionId: 2, // טכנולוגיה
    departmentId: 3 // מערכות מידע
  },
  {
    id: 7,
    employeeId: '6001',
    fullName: 'מירי דוד',
    roleCode: 6,
    roleDescription: 'חברי הנהלה וגורם מטה ארגוני',
    email: 'miri.david@company.com',
    password: '123456'
  },
  {
    id: 8,
    employeeId: '9001',
    fullName: 'טכני מערכת',
    roleCode: 9,
    roleDescription: 'גורם טכני',
    email: 'tech@company.com',
    password: '123456'
  }
];

// Helper function to find user by employee ID
export const findUserByEmployeeId = (employeeId: string): MockUser | undefined => {
  return mockUsers.find(user => user.employeeId === employeeId);
};

// Helper function to validate password
export const validateUserPassword = (user: MockUser, password: string): boolean => {
  return user.password === password;
};