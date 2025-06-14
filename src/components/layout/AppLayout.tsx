
import React from 'react';
import { Home, Plus, BarChart3, Target, Users, UserCog, Settings, Cog, TrendingUp, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { currentUser, navigationItems } from '../../data/mockData';
import { USER_ROLES } from '../../types';

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
  Calculator
};

interface AppLayoutProps {
  children: React.ReactNode;
  currentRoute?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, currentRoute = '/' }) => {
  const navigate = useNavigate();
  
  const userNavItems = navigationItems.filter(item => 
    item.roles.includes(currentUser.role)
  );

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full" dir="rtl">
      {/* Right Sidebar - Navigation - Narrower */}
      <div className="w-48 bg-white shadow-lg border-l border-gray-200">
        {/* Logo */}
        <div className="p-3 border-b border-gray-200">
          <div className="text-lg font-bold text-blue-600 text-center">
            PROJECTOR
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="text-right">
              <span className="text-sm text-gray-600">משתמש: </span>
              <span className="font-medium text-gray-800">{currentUser.name}</span>
              <span className="text-sm text-gray-500 mr-2">
                ({USER_ROLES[currentUser.role]})
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="2024">שנת עבודה: 2024</option>
                <option value="2025">שנת עבודה: 2025</option>
                <option value="2026">שנת עבודה: 2026</option>
              </select>
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
