import React from 'react';
import { Program, STATUS_CONFIG } from '../../types';
import StatusBadge from '../common/StatusBadge';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'לא הוגדר';
    return new Date(date).toLocaleDateString('he-IL');
  };

  const getComplexityLabel = (complexity?: number) => {
    switch (complexity) {
      case 1: return 'פשוט';
      case 2: return 'בינוני';
      case 3: return 'מורכב';
      default: return 'לא הוגדר';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-3">
        <StatusBadge status={task.status} size="sm" />
        <div className="text-right">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{task.title}</h3>
          <p className="text-sm text-gray-600">משימה #{task.taskId}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-right">
        <div className="flex justify-between">
          <span className="text-gray-500">גורם דורש:</span>
          <span className="font-medium">{task.requesterName}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">אגף:</span>
          <span>{task.divisionName}</span>
        </div>

        {task.domainName && (
          <div className="flex justify-between">
            <span className="text-gray-500">תחום:</span>
            <span>{task.domainName}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-500">רבעון נדרש:</span>
          <span>{formatDate(task.requiredQuarter)}</span>
        </div>

        {task.complexity && (
          <div className="flex justify-between">
            <span className="text-gray-500">מורכבות:</span>
            <span>{getComplexityLabel(task.complexity)}</span>
          </div>
        )}

        {task.assignedOfficerName && (
          <div className="flex justify-between">
            <span className="text-gray-500">קניין מטפל:</span>
            <span>{task.assignedOfficerName}</span>
          </div>
        )}

        {task.estimatedAmount && (
          <div className="flex justify-between">
            <span className="text-gray-500">אומדן:</span>
            <span>{task.estimatedAmount.toLocaleString()} {task.currency}</span>
          </div>
        )}
      </div>

      {task.description && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 text-right line-clamp-2">{task.description}</p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 text-right">
        עדכון אחרון: {formatDate(task.lastUpdate)}
      </div>
    </div>
  );
};

export default TaskCard;