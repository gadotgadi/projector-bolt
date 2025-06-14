
import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ProcurementLoad: React.FC = () => {
  const [viewMode, setViewMode] = useState<'teams' | 'all' | 'specific-team'>('teams');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'plan' | 'in-progress' | 'both'>('both');

  // Mock data for individual procurement officers
  const individualData = [
    {
      name: 'אלברט',
      team: 'יעודי',
      complexity1: 2,
      complexity2: 18,
      complexity3: 5,
      totalDays: 145,
      workDays: 190
    },
    {
      name: 'בצלאל',
      team: 'ביטחוני',
      complexity1: 1,
      complexity2: 4,
      complexity3: 12,
      totalDays: 89,
      workDays: 180
    },
    {
      name: 'גדעון',
      team: 'לוגיסטי',
      complexity1: 2,
      complexity2: 3,
      complexity3: 8,
      totalDays: 67,
      workDays: 200
    },
    {
      name: 'דהור',
      team: 'טכנולוגי',
      complexity1: 2,
      complexity2: 4,
      complexity3: 11,
      totalDays: 89,
      workDays: 170
    },
    {
      name: 'ויקטור',
      team: 'מחשוב',
      complexity1: 4,
      complexity2: 7,
      complexity3: 12,
      totalDays: 127,
      workDays: 190
    },
    {
      name: 'זבד',
      team: 'הנדסי',
      complexity1: 7,
      complexity2: 2,
      complexity3: 16,
      totalDays: 103,
      workDays: 200
    }
  ];

  // Mock data for team summary
  const teamData = [
    {
      team: 'יעודי',
      complexity1: 5,
      complexity2: 25,
      complexity3: 12,
      totalDays: 245,
      workDays: 380
    },
    {
      team: 'ביטחוני',
      complexity1: 3,
      complexity2: 8,
      complexity3: 18,
      totalDays: 167,
      workDays: 360
    },
    {
      team: 'לוגיסטי',
      complexity1: 6,
      complexity2: 12,
      complexity3: 22,
      totalDays: 234,
      workDays: 400
    },
    {
      team: 'טכנולוגי',
      complexity1: 4,
      complexity2: 15,
      complexity3: 28,
      totalDays: 287,
      workDays: 380
    },
    {
      team: 'מחשוב',
      complexity1: 8,
      complexity2: 18,
      complexity3: 35,
      totalDays: 389,
      workDays: 380
    },
    {
      team: 'הנדסי',
      complexity1: 12,
      complexity2: 8,
      complexity3: 25,
      totalDays: 273,
      workDays: 400
    }
  ];

  const teams = ['יעודי', 'ביטחוני', 'לוגיסטי', 'טכנולוגי', 'מחשוב', 'הנדסי'];

  const getStatusColor = (totalDays: number, workDays: number) => {
    const utilization = (totalDays / workDays) * 100;
    if (utilization > 90) return 'text-red-600 font-bold';
    if (utilization > 75) return 'text-orange-500 font-medium';
    return 'text-green-600';
  };

  const getCurrentData = () => {
    if (viewMode === 'teams') {
      return { data: teamData, isTeamView: true };
    } else if (viewMode === 'all') {
      return { data: individualData, isTeamView: false };
    } else if (viewMode === 'specific-team' && selectedTeam) {
      const filteredData = individualData.filter(officer => officer.team === selectedTeam);
      return { data: filteredData, isTeamView: false };
    }
    return { data: [], isTeamView: false };
  };

  const { data: currentData, isTeamView } = getCurrentData();

  const getTableTitle = () => {
    if (viewMode === 'teams') return 'העמסה מסכמת - לפי צוות';
    if (viewMode === 'all') return 'העמסה פרטנית - כל הקניינים';
    if (viewMode === 'specific-team' && selectedTeam) return `העמסה פרטנית - צוות ${selectedTeam}`;
    return 'העמסה פרטנית';
  };

  const getStatusFilterLabel = () => {
    switch (statusFilter) {
      case 'plan': return 'משימות בתכנון בלבד';
      case 'in-progress': return 'משימות בביצוע בלבד';
      case 'both': return 'כל המשימות';
      default: return 'כל המשימות';
    }
  };

  return (
    <AppLayout currentRoute="/procurement-load">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">העמסת קניינים</h1>
            <p className="text-gray-600 mt-1">
              חישוב היקף משאבים נדרשים לביצוע המשימות שבטיפול כל קניין/צוות
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* סינון לפי סטטוס */}
            <Select value={statusFilter} onValueChange={(value: 'plan' | 'in-progress' | 'both') => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">כל המשימות</SelectItem>
                <SelectItem value="plan">משימות בתכנון בלבד</SelectItem>
                <SelectItem value="in-progress">משימות בביצוע בלבד</SelectItem>
              </SelectContent>
            </Select>

            {/* בחירת צוות ספציפי */}
            {viewMode === 'specific-team' && (
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="בחר צוות" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* תצוגה */}
            <Select value={viewMode} onValueChange={(value: 'teams' | 'all' | 'specific-team') => setViewMode(value)}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teams">סיכום לפי צוותים</SelectItem>
                <SelectItem value="all">כל הקניינים</SelectItem>
                <SelectItem value="specific-team">צוות ספציפי</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader className="text-right">
            <CardTitle className="text-xl">
              {getTableTitle()}
            </CardTitle>
            <p className="text-gray-600 mt-1">
              חישוב על פי משקל משימות ברמות מורכבות שונות - {getStatusFilterLabel()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right font-bold">
                      {isTeamView ? 'צוות' : 'קניין'}
                    </TableHead>
                    {!isTeamView && (
                      <TableHead className="text-right font-bold">צוות</TableHead>
                    )}
                    <TableHead className="text-center font-bold">מורכב (3)</TableHead>
                    <TableHead className="text-center font-bold">בינוני (2)</TableHead>
                    <TableHead className="text-center font-bold">פשוט (1)</TableHead>
                    <TableHead className="text-center font-bold">סה"כ ימי עבודה נדרשים</TableHead>
                    <TableHead className="text-center font-bold">ימי עבודה זמינים</TableHead>
                    <TableHead className="text-center font-bold">אחוז עומס</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((item, index) => {
                    const utilization = ((item.totalDays / item.workDays) * 100).toFixed(1);
                    return (
                      <TableRow key={index}>
                        <TableCell className="text-right font-medium">
                          {isTeamView ? (item as any).team : (item as any).name}
                        </TableCell>
                        {!isTeamView && (
                          <TableCell className="text-right">{(item as any).team}</TableCell>
                        )}
                        <TableCell className="text-center">{item.complexity3}</TableCell>
                        <TableCell className="text-center">{item.complexity2}</TableCell>
                        <TableCell className="text-center">{item.complexity1}</TableCell>
                        <TableCell className="text-center font-bold">{item.totalDays}</TableCell>
                        <TableCell className="text-center">{item.workDays}</TableCell>
                        <TableCell className={`text-center ${getStatusColor(item.totalDays, item.workDays)}`}>
                          {utilization}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="font-bold text-green-700">תפוסה נמוכה</div>
                <div className="text-green-600">עד 75% עומס</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="font-bold text-orange-700">תפוסה גבוהה</div>
                <div className="text-orange-600">75-90% עומס</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="font-bold text-red-700">עומס יתר</div>
                <div className="text-red-600">מעל 90% עומס</div>
              </div>
            </div>

            {/* Formula explanation */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
              <div className="font-bold mb-2">נוסחת חישוב ימי עבודה נדרשים:</div>
              <div className="text-gray-700">
                (מספר משימות מורכבות × 3 ימים) + (מספר משימות בינוניות × 2 ימים) + (מספר משימות פשוטות × 1 יום)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProcurementLoad;
