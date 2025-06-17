import React from 'react';
import { Program, STATUS_CONFIG } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🚀🚀🚀 TASKCARD V7.0 LOADED! Task:', task.taskId, 'onClick exists:', !!onClick);
  
  const statusConfig = STATUS_CONFIG[task.status];
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 TaskCard clicked for task:', task.taskId);
    
    if (onClick) {
      console.log('🎯 Calling onClick callback...');
      onClick();
    } else {
      console.log('🎯 No onClick callback provided');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 MOUSE DOWN on task:', task.taskId);
    
    if (onClick) {
      console.log('🎯 Calling onClick from mouseDown...');
      onClick();
    }
  };
  
  return (
    <div 
      className="bg-white rounded-lg border border-gray-300 p-4 relative cursor-pointer hover:shadow-lg transition-shadow select-none"
      style={{ 
        height: '240px', 
        width: '100%',
        pointerEvents: 'auto',
        zIndex: 10,
        userSelect: 'none'
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* Status Badge */}
      <div className="absolute top-2 left-2 pointer-events-none">
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
      <div className="text-right text-lg font-bold text-gray-800 mb-2 mt-6 pointer-events-none">
        משימה #{task.taskId}
      </div>

      {/* Title */}
      <div className="text-right text-base font-semibold text-gray-900 mb-2 line-clamp-2 pointer-events-none">
        {task.title}
      </div>

      {/* Description */}
      <div className="text-right text-sm text-gray-600 mb-3 line-clamp-2 pointer-events-none">
        {task.description || 'אין תיאור'}
      </div>

      {/* Details */}
      <div className="text-right text-xs text-gray-500 space-y-1 pointer-events-none">
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
      <div className="absolute bottom-2 right-2 text-xs text-blue-600 pointer-events-none">
        לחץ לפרטים →
      </div>
    </div>
  );
};

export default TaskCard;