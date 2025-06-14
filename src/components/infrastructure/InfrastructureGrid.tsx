
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings, UserCheck, Tag, Building, Shield } from 'lucide-react';

interface InfrastructureTable {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
}

const infrastructureTables: InfrastructureTable[] = [
  {
    id: 'organizational-roles',
    title: 'תפקידים ארגוניים',
    description: 'Organizational Role - ניהול התפקידים והרשאות במערכת',
    icon: <UserCheck className="w-6 h-6" />,
    route: '/infrastructure-maintenance/organizational-roles'
  },
  {
    id: 'status-values',
    title: 'כינויי סטטוס',
    description: 'Status Value - הגדרת הכינויים העבריים לסטטוסי משימות',
    icon: <Tag className="w-6 h-6" />,
    route: '/infrastructure-maintenance/status-values'
  },
  {
    id: 'structure-values',
    title: 'כינויי מבנה ארגוני',
    description: 'Structure Value - הגדרת הכינויים העבריים לגופים הארגוניים',
    icon: <Building className="w-6 h-6" />,
    route: '/infrastructure-maintenance/structure-values'
  },
  {
    id: 'permissions',
    title: 'הרשאות מערכת',
    description: 'Permissions - הגדרת הרשאות לטיפול במשימות',
    icon: <Shield className="w-6 h-6" />,
    route: '/infrastructure-maintenance/permissions'
  }
];

const InfrastructureGrid: React.FC = () => {
  const navigate = useNavigate();

  const handleTableClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {infrastructureTables.map((table) => (
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

export default InfrastructureGrid;
