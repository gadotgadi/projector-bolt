// Role-based permissions and routing logic

export interface UserRole {
  code: number;
  name: string;
  defaultRoute: string;
}

export const USER_ROLES: Record<number, UserRole> = {
  0: { code: 0, name: 'מנהלן מערכת', defaultRoute: '/system-settings' },
  1: { code: 1, name: 'מנהל רכש', defaultRoute: '/' },
  2: { code: 2, name: 'ראש צוות', defaultRoute: '/' },
  3: { code: 3, name: 'קניין', defaultRoute: '/' },
  4: { code: 4, name: 'גורם דורש', defaultRoute: '/' },
  9: { code: 9, name: 'גורם טכני', defaultRoute: '/infrastructure-maintenance' }
};

export const getDefaultRouteForRole = (roleCode: number): string => {
  return USER_ROLES[roleCode]?.defaultRoute || '/';
};

export const hasPermissionForRoute = (roleCode: number, route: string): boolean => {
  const permissions: Record<string, number[]> = {
    '/': [1, 2, 3, 4], // שולחן עבודה
    '/new-task': [1, 4], // דרישה חדשה
    '/engagement-types': [1, 0], // סוגי התקשרויות
    '/procurement-staff': [1, 0], // עובדי הרכש
    '/progress-tracking': [1], // מעקב התקדמות
    '/planning-convergence': [1], // התכנסות תכנון
    '/procurement-load': [1, 2], // העמסת קניינים
    '/system-settings': [0, 9], // הגדרות מערכת
    '/infrastructure-maintenance': [9], // תחזוקת תשתיות
  };

  // Station assignment is accessible to anyone who has dashboard access
  if (route.startsWith('/station-assignment/')) {
    return permissions['/'].includes(roleCode);
  }

  // System settings sub-routes
  if (route.startsWith('/system-settings/')) {
    return permissions['/system-settings'].includes(roleCode);
  }

  // Infrastructure maintenance sub-routes
  if (route.startsWith('/infrastructure-maintenance/')) {
    return permissions['/infrastructure-maintenance'].includes(roleCode);
  }

  return permissions[route]?.includes(roleCode) || false;
};