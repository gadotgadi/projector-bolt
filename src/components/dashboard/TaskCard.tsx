import React from 'react';
import { Program, STATUS_CONFIG } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🚀🚀🚀 TASKCARD V6.0 LOADED! Task:', task.taskId, 'onClick exists:', !!onClick);
  
  const statusConfig = STATUS_CONFIG[task.status];
  
  const handleClick = () => {
    console.log('🎯 TaskCard clicked for task:', task.taskId);
    
    if (onClick) {
      console.log('🎯 Calling onClick callback...');
      onClick();
    } else {
      console.log('🎯 No onClick callback provided');
    }
  };
  
  return (
    <div 
      className="bg-white rounded-lg border border-gray-300 p-4 relative cursor-pointer hover:shadow-lg transition-shadow"
      style={{ 
        height: '240px', 
        width: '100%',
        pointerEvents: 'auto',
        zIndex: 10
      }}
      onClick={handleClick}
    >
      {/* Status Badge */}
      <div className="absolute top-2 left-2">
        <span 
          className="px-2 py-1 text-xs rounded-full font-medium border"
          style={{ 
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.color,
            borderColor: statusConfig.color + '40'
          }}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Task ID */}
      <div className="text-right text-lg font-bold text-gray-800 mb-2 mt-6">
        משימה #{task.taskId}
      </div>

      {/* Title */}
      <div className="text-right text-base font-semibold text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </div>

      {/* Description */}
      <div className="text-right text-sm text-gray-600 mb-3 line-clamp-2">
        {task.description || 'אין תיאור'}
      </div>

      {/* Details */}
      <div className="text-right text-xs text-gray-500 space-y-1">
        <div>גורם דורש: {task.requesterName}</div>
        <div>אגף: {task.divisionName}</div>
        {task.assignedOfficerName && (
          <div>קניין מטפל: {task.assignedOfficerName}</div>
        )}
        {task.estimatedAmount && (
          <div>
            אומדן: {task.estimatedAmount.toLocaleString()} {task.currency}
          </div>
        )}
      </div>

      {/* Click indicator */}
      <div className="absolute bottom-2 right-2 text-xs text-blue-600">
        לחץ לפרטים →
      </div>
    </div>
  );
};

export default TaskCard;