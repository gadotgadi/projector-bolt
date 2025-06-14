
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, Building, Briefcase, UserCheck, Target } from 'lucide-react';

interface TableConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
}

const tableConfigs: TableConfig[] = [
  {
    id: 'activity-pool',
    title: 'פעילויות רכש',
    description: 'Activity Pool - ניהול פעילויות הרכש במערכת',
    icon: <Target className="w-6 h-6" />,
    route: '/system-settings/activity-pool'
  },
  {
    id: 'domains',
    title: 'תחומי רכש',
    description: 'Domain - ניהול תחומי הרכש',
    icon: <Briefcase className="w-6 h-6" />,
    route: '/system-settings/domains'
  },
  {
    id: 'workers',
    title: 'עובדים',
    description: 'Workers - ניהול רשימת העובדים',
    icon: <Users className="w-6 h-6" />,
    route: '/system-settings/workers'
  },
  {
    id: 'divisions',
    title: 'אגפים',
    description: 'Division - ניהול אגפי הארגון',
    icon: <Building className="w-6 h-6" />,
    route: '/system-settings/divisions'
  },
  {
    id: 'departments',
    title: 'מחלקות',
    description: 'Department - ניהול מחלקות הארגון',
    icon: <Building className="w-6 h-6" />,
    route: '/system-settings/departments'
  },
  {
    id: 'procurement-teams',
    title: 'צוותי רכש',
    description: 'Procurement team - ניהול צוותי הרכש',
    icon: <UserCheck className="w-6 h-6" />,
    route: '/system-settings/procurement-teams'
  }
];

const SystemSettingsGrid: React.FC = () => {
  const navigate = useNavigate();

  const handleTableClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tableConfigs.map((table) => (
        <Card key={table.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="text-right">
            <div className="flex items-center justify-between">
              <div className="text-blue-600">
                {table.icon}
              </div>
              <CardTitle className="text-lg">{table.title}</CardTitle>
            </div>
            <CardDescription className="text-right">
              {table.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleTableClick(table.route)}
              className="w-full"
              variant="outline"
            >
              <Settings className="w-4 h-4 ml-2" />
              ניהול טבלה
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SystemSettingsGrid;
