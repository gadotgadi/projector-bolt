import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Program, STATUS_CONFIG } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const navigate = useNavigate();
  
  console.log('🚀🚀🚀 TASKCARD V12.0 LOADED! Task:', task.taskId, 'onClick exists:', !!onClick);
  
  const statusConfig = STATUS_CONFIG[task.status];
  
  const navigateToTask = () => {
    console.log('🎯🎯🎯 NAVIGATION TRIGGERED for task:', task.taskId);
    
    // Navigate to the actual station assignment page
    const stationUrl = `/station-assignment/${task.taskId}`;
    console.log('🎯🎯🎯 Station URL:', stationUrl);
    
    // Show alert first to confirm click is working
    alert(`🎯 Going to Station Assignment for task ${task.taskId}`);
    
    // Use React Router to navigate to station assignment
    try {
      navigate(stationUrl);
      console.log('🎯🎯🎯 React Router navigation to station assignment executed');
    } catch (error) {
      console.error('🎯🎯🎯 Navigation failed:', error);
    }
  };
  
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      style={{ height: '240px', width: '100%' }}
      onClick={navigateToTask}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Status Badge */}
        <div className="flex justify-between items-start mb-3">
          <span 
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ 
              backgroundColor: statusConfig.bgColor,
              color: statusConfig.color 
            }}
          >
            {statusConfig.label}
          </span>
          <span className="text-sm font-bold text-gray-600">#{task.taskId}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 text-right">
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 text-right">
            {task.description}
          </p>
        )}

        {/* Details */}
        <div className="mt-auto space-y-1 text-xs text-gray-500 text-right">
          <div>גורם דורש: {task.requesterName}</div>
          <div>אגף: {task.divisionName}</div>
          {task.assignedOfficerName && (
            <div>קניין מטפל: {task.assignedOfficerName}</div>
          )}
          {task.requiredQuarter && (
            <div>רבעון נדרש: {task.requiredQuarter.toLocaleDateString('he-IL')}</div>
          )}
        </div>

        {/* Click indicator */}
        <div className="mt-2 text-center">
          <span className="text-xs text-blue-600 font-medium">🎯 לחץ לטיפול</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;