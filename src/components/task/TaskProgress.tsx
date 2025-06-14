
import React from 'react';
import { Program } from '../../types';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';

interface TaskProgressProps {
  task: Program;
}

const TaskProgress: React.FC<TaskProgressProps> = ({ task }) => {
  const formatDate = (date?: Date) => {
    if (!date) return '--';
    return date.toLocaleDateString('he-IL');
  };

  const stations = [
    { id: 1, name: 'קבלת הדרישה', completed: true, date: task.createdAt },
    { id: 2, name: 'תכנון', completed: ['Plan', 'In Progress', 'Complete', 'Done'].includes(task.status), date: task.startDate },
    { id: 3, name: 'ביצוע', completed: ['In Progress', 'Complete', 'Done'].includes(task.status), date: task.startDate },
    { id: 4, name: 'השלמה', completed: ['Complete', 'Done'].includes(task.status), date: task.completionDate },
    { id: 5, name: 'סגירה', completed: task.status === 'Done', date: task.completionDate }
  ];

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">מעקב התקדמות</h3>
      
      {/* Progress Timeline */}
      <div className="space-y-4">
        {stations.map((station, index) => (
          <div key={station.id} className="flex items-center gap-4">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              station.completed ? 'bg-green-500 text-white' : 'bg-gray-300'
            }`}>
              {station.completed ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="text-xs">{station.id}</span>
              )}
            </div>
            
            <div className="flex-1">
              <span className={`font-medium ${station.completed ? 'text-green-700' : 'text-gray-600'}`}>
                {station.name}
              </span>
              {station.date && (
                <span className="text-sm text-gray-500 mr-2">
                  - {formatDate(station.date)}
                </span>
              )}
            </div>
            
            {index < stations.length - 1 && (
              <div className={`w-0.5 h-8 ${station.completed ? 'bg-green-500' : 'bg-gray-300'} absolute right-3 mt-6`} />
            )}
          </div>
        ))}
      </div>

      {/* Time Info */}
      <div className="mt-6 pt-4 border-t grid grid-cols-1 gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            שנת עבודה: {task.workYear}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-600">
            רבעון נדרש: {formatDate(task.requiredQuarter)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskProgress;
