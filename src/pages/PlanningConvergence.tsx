
import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const PlanningConvergence: React.FC = () => {
  // Mock data for teams and their capacity vs demand
  const teamsData = [
    {
      team: 'יעודי',
      availableDays: 445,
      requiredDays: 425,
      workers: [
        { name: 'מורכב', type: 'מורכב', days: 0 },
        { name: 'שמואל', type: 'שמואל', days: 0 },
        { name: 'יעקב', type: 'יעקב', days: 0 },
        { name: 'שלמית', type: 'שלמית', days: 0 }
      ],
      tasks: [
        { complexity: 'מורכב (3)', count: '(3) days בינוני', value: 0 },
        { complexity: 'בינוני (2)', count: '(2) days פשוט', value: 0 },
        { complexity: 'פשוט (1)', count: '(1) days', value: 0 }
      ]
    },
    {
      team: 'מחשוב',
      availableDays: 360,
      requiredDays: 320,
      workers: [
        { name: 'אין', type: 'אין', days: 0 },
        { name: 'שרון', type: 'שרון', days: 0 },
        { name: 'עגלה', type: 'עגלה', days: 0 },
        { name: 'לוסי', type: 'לוסי', days: 0 }
      ],
      tasks: [
        { complexity: 'מורכב (3)', count: '(3) days בינוני', value: 0 },
        { complexity: 'בינוני (2)', count: '(2) days פשוט', value: 0 },
        { complexity: 'פשוט (1)', count: '(1) days', value: 0 }
      ]
    },
    {
      team: 'טכנולוגי',
      availableDays: 410,
      requiredDays: 480,
      workers: [
        { name: 'עדי', type: 'עדי', days: 0 },
        { name: 'רחלי', type: 'רחלי', days: 0 },
        { name: 'נילה', type: 'נילה', days: 0 },
        { name: 'ניס', type: 'ניס', days: 0 }
      ],
      tasks: [
        { complexity: 'מורכב (3)', count: '(3) days בינוני', value: 0 },
        { complexity: 'בינוני (2)', count: '(2) days פשוט', value: 0 },
        { complexity: 'פשוט (1)', count: '(1) days', value: 0 }
      ]
    },
    {
      team: 'לוגיסטי',
      availableDays: 490,
      requiredDays: 520,
      workers: [
        { name: 'ליל', type: 'ליל', days: 0 },
        { name: 'תומר', type: 'תומר', days: 0 },
        { name: 'אבי', type: 'אבי', days: 0 },
        { name: 'בני', type: 'בני', days: 0 }
      ],
      tasks: [
        { complexity: 'מורכב (3)', count: '(3) days בינוני', value: 0 },
        { complexity: 'בינוני (2)', count: '(2) days פשוט', value: 0 },
        { complexity: 'פשוט (1)', count: '(1) days', value: 0 }
      ]
    },
    {
      team: 'ביטחוני',
      availableDays: 310,
      requiredDays: 270,
      workers: [
        { name: 'הנו', type: 'הנו', days: 0 },
        { name: 'בלו', type: 'בלו', days: 0 },
        { name: 'שי', type: 'שי', days: 0 },
        { name: 'זהר', type: 'זהר', days: 0 }
      ],
      tasks: [
        { complexity: 'מורכב (3)', count: '(3) days בינוני', value: 0 },
        { complexity: 'בינוני (2)', count: '(2) days פשוט', value: 0 },
        { complexity: 'פשوט (1)', count: '(1) days', value: 0 }
      ]
    },
    {
      team: 'יעודי נוסף',
      availableDays: 175,
      requiredDays: 280,
      workers: [
        { name: 'ראובן', type: 'ראובן', days: 0 },
        { name: 'שמעון', type: 'שמעון', days: 0 },
        { name: 'לוי', type: 'לוי', days: 0 },
        { name: 'צבי', type: 'צבי', days: 0 }
      ],
      tasks: [
        { complexity: 'מורכב (3)', count: '(3) days בינוני', value: 0 },
        { complexity: 'בינוני (2)', count: '(2) days פשוט', value: 0 },
        { complexity: 'פשוט (1)', count: '(1) days', value: 0 }
      ]
    }
  ];

  return (
    <AppLayout currentRoute="/planning-convergence">
      <div className="space-y-6">
        {/* Navigation arrows */}
        <div className="flex justify-between items-center">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
            <span>מידע בקיש</span>
            <span>&lt;</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
            <span>&gt;</span>
            <span>מידע קודם</span>
          </button>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamsData.map((team, index) => {
            const chartData = [{
              name: team.team,
              available: team.availableDays,
              required: team.requiredDays
            }];
            
            return (
              <Card key={index} className="border-2" style={{ borderColor: team.availableDays >= team.requiredDays ? '#22c55e' : '#ef4444' }}>
                <CardHeader className="text-center">
                  <CardTitle className="text-lg font-bold">צוות: {team.team}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Bar Chart */}
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="available" fill="#fbbf24" name="כ'א זמינים" />
                          <Bar dataKey="required" fill="#3b82f6" name="כ'א נדרשים" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded" />
                        <span>כ'א זמינים</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded" />
                        <span>כ'א נדרשים</span>
                      </div>
                    </div>

                    {/* Workers List */}
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium text-center mb-2">עובדי הצוות</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {team.workers.map((worker, idx) => (
                          <div key={idx} className="text-center">
                            <div>{worker.name}</div>
                            <div className="text-gray-500">({worker.days}) days</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tasks Breakdown */}
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium text-center mb-2">פילוח משימות</div>
                      <div className="space-y-1 text-xs">
                        {team.tasks.map((task, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{task.complexity}</span>
                            <span>{task.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default PlanningConvergence;
