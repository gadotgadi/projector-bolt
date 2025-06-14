
import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const ProgressTracking: React.FC = () => {
  // Mock data for status distribution
  const statusData = [
    { name: 'Open', value: 23, color: '#3b82f6' },
    { name: 'Plan', value: 41, color: '#60a5fa' },
    { name: 'In Progress', value: 128, color: '#1d4ed8' },
    { name: 'Complete', value: 28, color: '#93c5fd' },
    { name: 'Done', value: 79, color: '#1e40af' },
    { name: 'Freeze', value: 15, color: '#dbeafe' }
  ];

  // Mock data for initiation delays
  const initiationData = [
    { team: 'יעודי', delayed: 7, onTime: 12 },
    { team: 'ביטחוני', delayed: 2, onTime: 4 },
    { team: 'לוגיסטי', delayed: 2, onTime: 8 },
    { team: 'טכנולוגי', delayed: 3, onTime: 6 },
    { team: 'מחשוב', delayed: 2, onTime: 16 },
    { team: 'הנדסי', delayed: 2, onTime: 13 }
  ];

  // Mock data for progress delays
  const progressData = [
    { team: 'יעודי', moreThan30: 2, between15to30: 18, between5to15: 5, lessThan5: 'יעודי' },
    { team: 'ביטחוני', moreThan30: 1, between15to30: 4, between5to15: 12, lessThan5: 'ביטחוני' },
    { team: 'לוגיסטי', moreThan30: 2, between15to30: 3, between5to15: 8, lessThan5: 'לוגיסטי' },
    { team: 'טכנולוגי', moreThan30: 2, between15to30: 4, between5to15: 11, lessThan5: 'טכנולוגי' },
    { team: 'מחשוב', moreThan30: 4, between15to30: 7, between5to15: 12, lessThan5: 'מחשוב' },
    { team: 'הנדסי', moreThan30: 7, between15to30: 2, between5to15: 16, lessThan5: 'הנדסי' }
  ];

  return (
    <AppLayout currentRoute="/progress-tracking">
      <div className="space-y-6">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader className="text-right">
              <CardTitle className="text-lg">התפלגות משימות לפי סטטוס</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Initiation Analysis */}
          <Card>
            <CardHeader className="text-right">
              <CardTitle className="text-lg">עיכוב בהתנעת משימות</CardTitle>
              <p className="text-sm text-gray-600">משימות בסטטוס Plan</p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={initiationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="team" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="delayed" fill="#ef4444" name="מעל הנדרש להתנעה" />
                    <Bar dataKey="onTime" fill="#22c55e" name="בזמן להתנעה" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span>מעל הנדרש להתנעה</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>בזמן להתנעה</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Analysis */}
          <Card>
            <CardHeader className="text-right">
              <CardTitle className="text-lg">זמן המתנה באותה תחנה</CardTitle>
              <p className="text-sm text-gray-600">משימות בסטטוס In Progress</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progressData.map((team) => (
                  <div key={team.team} className="text-right">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{team.team}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-xs">
                      <div className="bg-red-500 text-white p-1 rounded text-center">
                        {team.moreThan30} &gt;30
                      </div>
                      <div className="bg-orange-400 text-white p-1 rounded text-center">
                        {team.between15to30} 15-30
                      </div>
                      <div className="bg-yellow-400 text-white p-1 rounded text-center">
                        {team.between5to15} 5-15
                      </div>
                      <div className="bg-green-500 text-white p-1 rounded text-center">
                        מתחת ל-5
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium">טווח ימים:</div>
                  <div>מאז השלמת תחנה</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">משימות:</div>
                  <div>לפי צוות</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProgressTracking;
