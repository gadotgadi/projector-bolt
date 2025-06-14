
import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface WorkerData {
  name: string;
  availableDays: number;
  taskLoad: number;
  utilizationPercent: number;
}

const ProcurementLoad: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024');

  // Mock data for worker workload
  const workersData: WorkerData[] = [
    { name: 'אלברט', availableDays: 190, taskLoad: 180, utilizationPercent: 95 },
    { name: 'בצלאל', availableDays: 180, taskLoad: 160, utilizationPercent: 89 },
    { name: 'גדעון', availableDays: 200, taskLoad: 190, utilizationPercent: 95 },
    { name: 'דהור', availableDays: 170, taskLoad: 150, utilizationPercent: 88 },
    { name: 'ויקטור', availableDays: 190, taskLoad: 185, utilizationPercent: 97 },
    { name: 'זבד', availableDays: 200, taskLoad: 195, utilizationPercent: 98 },
    { name: 'טוהר', availableDays: 190, taskLoad: 170, utilizationPercent: 89 },
    { name: 'יהיד', availableDays: 170, taskLoad: 165, utilizationPercent: 97 },
    { name: 'לביא', availableDays: 80, taskLoad: 78, utilizationPercent: 98 },
    { name: 'משה', availableDays: 190, taskLoad: 180, utilizationPercent: 95 },
    { name: 'שרית', availableDays: 160, taskLoad: 155, utilizationPercent: 97 }
  ];

  const teams = ['יעודי', 'ביטחוני', 'לוגיסטי', 'טכנולוגי', 'מחשוב', 'הנדסי'];

  const handleRebalance = () => {
    alert('תכונת איזון עומסים תהיה זמינה בגרסה הבאה');
  };

  const handleExport = () => {
    alert('יצוא נתונים יהיה זמין בגרסה הבאה');
  };

  return (
    <AppLayout currentRoute="/procurement-load">
      <div className="space-y-6">
        {/* Control Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <Button onClick={handleRebalance} variant="outline">
              איזון עומסים
            </Button>
            <Button onClick={handleExport} variant="outline">
              יצוא נתונים
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="בחר צוות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הצוותים</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Workers Load Table */}
        <Card>
          <CardHeader className="text-right">
            <CardTitle className="text-xl">פירוט עומסת קניינים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-right font-semibold">שם קניין</th>
                    <th className="p-3 text-right font-semibold">ימים זמינים</th>
                    <th className="p-3 text-right font-semibold">עומס משימות</th>
                    <th className="p-3 text-right font-semibold">אחוז ניצול</th>
                    <th className="p-3 text-right font-semibold">סטטוס</th>
                    <th className="p-3 text-right font-semibold">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {workersData.map((worker, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{worker.name}</td>
                      <td className="p-3">{worker.availableDays}</td>
                      <td className="p-3">{worker.taskLoad}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          worker.utilizationPercent >= 95 
                            ? 'bg-red-100 text-red-800' 
                            : worker.utilizationPercent >= 85 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {worker.utilizationPercent}%
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          worker.utilizationPercent >= 95 
                            ? 'bg-red-100 text-red-800' 
                            : worker.utilizationPercent >= 85 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {worker.utilizationPercent >= 95 ? 'עומס יתר' : 
                           worker.utilizationPercent >= 85 ? 'עומס גבוה' : 'תקין'}
                        </span>
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm">
                          פרטים
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card>
          <CardHeader className="text-right">
            <CardTitle className="text-lg">התפלגות עומסים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="availableDays" fill="#93c5fd" name="ימים זמינים" />
                  <Bar dataKey="taskLoad" fill="#3b82f6" name="עומס משימות" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProcurementLoad;
