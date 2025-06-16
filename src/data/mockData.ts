import { NavItem, User } from "../types";

// Mock activity pool for demo purposes
export const mockActivityPool = [
  { id: 1, name: 'בדיקת הצעות מחיר' },
  { id: 2, name: 'הכנת מפרט טכני' },
  { id: 3, name: 'פרסום מכרז' },
  { id: 4, name: 'הערכת הצעות' },
  { id: 5, name: 'בחירת זוכה' },
  { id: 6, name: 'חתימה על הסכם' },
  { id: 7, name: 'בקרת איכות' },
  { id: 8, name: 'אישור תשלום' },
  { id: 9, name: 'מעקב ביצוע' },
  { id: 10, name: 'סגירת פרויקט' },
  { id: 11, name: 'דו"ח סיכום' }
];

// Mock current user - will be replaced by authentication system
export const currentUser: User = {
  id: '1',
  name: 'אבי כהן',
  role: 'procurement_manager',
  department: 'רכש',
  division: 'תפעול',
  teamId: '1',
  workDaysAvailable: 200
};

// Navigation items - now handled by AppLayout based on user role
export const navigationItems: NavItem[] = [];

// Export mock programs from separate file
export { mockPrograms } from './mockPrograms';