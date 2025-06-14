
import React from 'react';
import { Program, STATUS_CONFIG } from '../../types';
import { Calendar, User, Building2, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const statusConfig = STATUS_CONFIG[task.status];
  
  const formatDate = (date?: Date) => {
    if (!date) return '--';
    return date.toLocaleDateString('he-IL');
  };

  const getComplexityText = (complexity?: number) => {
    if (!complexity) return 'לא ידוע';
    const levels = { 1: 'פשוט', 2: 'בינוני', 3: 'מורכב' };
    return levels[complexity as keyof typeof levels] || 'לא ידוע';
  };

  return (
    <div 
      className="bg-white rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
      style={{ backgroundColor: statusConfig.bgColor }}
      onClick={onClick}
    >
      {/* Task ID */}
      <div className="text-right mb-2">
        <span className="text-lg font-bold text-gray-800">#{task.taskId}</span>
      </div>

      {/* Title */}
      <h3 className="text-right font-bold text-gray-800 mb-3 text-lg leading-tight">
        {task.title}
      </h3>

      {/* Status Badge */}
      <div className="flex justify-end mb-3">
        <span 
          className="px-3 py-1 rounded-full text-sm font-medium border"
          style={{ 
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.color,
            borderColor: statusConfig.color + '40'
          }}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Details Grid */}
      <div className="space-y-2 text-sm">
        {/* Requester */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-gray-600">{task.requesterName}</span>
          <User className="w-4 h-4 text-gray-500" />
        </div>

        {/* Department */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-gray-600">{task.departmentName || task.divisionName}</span>
          <Building2 className="w-4 h-4 text-gray-500" />
        </div>

        {/* Required Date */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-gray-600">{formatDate(task.requiredQuarter)}</span>
          <Calendar className="w-4 h-4 text-gray-500" />
        </div>

        {/* Assigned Officer */}
        {task.assignedOfficerName && (
          <div className="flex items-center justify-end gap-2">
            <span className="text-gray-600">מטפל: {task.assignedOfficerName}</span>
            <User className="w-4 h-4 text-blue-500" />
          </div>
        )}

        {/* Complexity & Domain */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-300">
          <span className="text-xs text-gray-500">{task.domainName || 'לא צוין'}</span>
          <span className="text-xs text-gray-500">
            רמת מורכבות: {getComplexityText(task.complexity)}
          </span>
        </div>

        {/* Work Year */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-gray-600">שנת עבודה: {task.workYear}</span>
          <Clock className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
