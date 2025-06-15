import React from 'react';
import { Home, Plus, BarChart3, Target, Users, UserCog, Settings, Cog, TrendingUp, Calculator, LogOut, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../ui/button';

const iconMap = {
  Home,
  Plus,
  BarChart3,
  Target,
  Users,
  UserCog,
  Settings,
  Cog,
  TrendingUp,
  Calculator,
  Wrench
};

interface NavItem {
  id: string;
  label: string;
  icon: string;
  roles: number[];
  route: string;
  requiresAcceptanceCheck?: boolean;
}

interface AppLayoutProps {
  children: React.ReactNode;
  currentRoute?: string;
  pageTitle?: string;
}

const getPageTitle = (route: string) => {
  const routeMap: { [key: string]: string } = {
    '/': 'שולחן עבודה',
    '/new-task': 'דרישה חדשה',
    '/station-assignment': 'עדכון משימה',
    '/engagement-types': 'סוגי התקשרויות',
    '/procurement-staff': 'עובדי רכש',
    '/progress-tracking': 'מעקב התקדמות',
    '/planning-convergence': 'התקבצות תכנון',
    '/procurement-load': 'עומסת קניינים',
    '/planning-helpers': 'עזרי תכנון',
    '/system-settings': 'הגדרות מערכת',
    '/infrastructure-maintenance': 'תחזוקת תשתיות'
  };
  
  return routeMap[route] || 'שולחן עבודה';
};

// Navigation items with role-based access and acceptance option checks
const navigationItems: NavItem[] = [
  {
    id: '1',
    label: 'שולחן עבודה',
    icon: 'Home',
    roles: [1, 2, 3, 4], // מנהל רכש, ראש צוות, קניין, גורם דורש
    route: '/'
  },
  {
    id: '2',
    label: 'דרישה חדשה',
    icon: 'Plus',
    roles: [1, 4], // מנהל רכש, גורם דורש
    route: '/new-task',
    requiresAcceptanceCheck: true
  },
  {
    id: '3',
    label: 'סוגי התקשרויות',
    icon: 'Target',
    roles: [1, 0], // מנהל רכש, מנהלן מערכת
    route: '/engagement-types'
  },
  {
    id: '4',
    label: 'עובדי הרכש',
    icon: 'Users',
    roles: [1, 0], // מנהל רכש, מנהלן מערכת
    route: '/procurement-staff'
  },
  {
    id: '7',
    label: 'מעקב התקדמות',
    icon: 'BarChart3',
    roles: [1], // מנהל רכש בלבד
    route: '/progress-tracking'
  },
  {
    id: '8',
    label: 'התכנסות תכנון',
    icon: 'Users',
    roles: [1], // מנהל רכש בלבד
    route: '/planning-convergence'
  },
  {
    id: '9',
    label: 'העמסת קניינים',
    icon: 'TrendingUp',
    roles: [1, 2], // מנהל רכש, ראש צוות
    route: '/procurement-load'
  },
  {
    id: '10',
    label: 'עזרי תכנון',
    icon: 'Wrench',
    roles: [1, 0], // מנהל רכש, מנהלן מערכת
    route: '/planning-helpers'
  },
  {
    id: '5',
    label: 'הגדרות מערכת',
    icon: 'Settings',
    roles: [0, 9], // מנהלן מערכת, גורם טכני
    route: '/system-settings'
  },
  {
    id: '6',
    label: 'תחזוקת תשתיות',
    icon: 'Cog',
    roles: [9], // גורם טכני בלבד
    route: '/infrastructure-maintenance'  
  }
];

const AppLayout: React.FC<AppLayoutProps> = ({ children, currentRoute = '/', pageTitle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [acceptanceOption, setAcceptanceOption] = React.useState<any>(null);
  
  if (!user) {
    return null; // This should not happen as the app should redirect to login
  }

  // Load acceptance option for current year
  React.useEffect(() => {
    const loadAcceptanceOption = async () => {
      try {
        const response = await fetch('/api/planning/acceptance-options');
        if (response.ok) {
          const data = await response.json();
          const currentYear = new Date().getFullYear();
          const currentYearOption = data.find((opt: any) => opt.yearId === currentYear);
          setAcceptanceOption(currentYearOption);
        }
      } catch (error) {
        console.error('Error loading acceptance option:', error);
      }
    };

    loadAcceptanceOption();
  }, []);

  // Filter navigation items based on user role and acceptance options
  const getFilteredNavItems = () => {
    return navigationItems.filter(item => {
      // Check role permission
      if (!item.roles.includes(user.roleCode)) {
        return false;
      }

      // Check acceptance option for new task
      if (item.requiresAcceptanceCheck && acceptanceOption) {
        if (user.roleCode === 1) {
          // Procurement manager can access unless status is 'Finish'
          return acceptanceOption.uploadCode !== 'Finish';
        }
        
        if (user.roleCode === 4) {
          // Requester can access only if status is 'Plan' or 'Late'
          return ['Plan', 'Late'].includes(acceptanceOption.uploadCode);
        }
      }

      return true;
    });
  };

  const userNavItems = getFilteredNavItems();

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayPageTitle = pageTitle || getPageTitle(currentRoute);

  return (
    <div className="min-h-screen bg-gray-50 flex w-full" dir="rtl">
      {/* Right Sidebar - Navigation - Narrower */}
      <div className="w-48 bg-white shadow-lg border-l border-gray-200">
        {/* Logo */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex justify-center">
            <img 
              src="/image.png" 
              alt="PROJECTOR Logo" 
              className="h-8 w-auto"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3">
          <ul className="space-y-1">
            {userNavItems.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              const isActive = item.route === currentRoute;
              
              // Add safety check for undefined icons
              if (!Icon) {
                console.warn(`Icon "${item.icon}" not found in iconMap`);
                return null;
              }
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.route)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-right text-sm ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info and Logout */}
        <div className="absolute bottom-0 w-48 p-3 border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-600 mb-2 text-right">
            <div className="font-medium">{user.fullName}</div>
            <div className="text-xs">{user.roleDescription}</div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            size="sm" 
            className="w-full flex items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            יציאה
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-gray-800">
                {displayPageTitle}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
              <span className="font-medium text-gray-800">{user.fullName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;