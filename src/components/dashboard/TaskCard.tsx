import React from 'react';
import { Program, STATUS_CONFIG } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🚀🚀🚀 TASKCARD V15.0 LOADED! Task:', task.taskId, 'onClick exists:', !!onClick);
  
  const statusConfig = STATUS_CONFIG[task.status];
  
  return (
    <div 
      className="bg-white rounded-lg border-4 border-red-500 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
      style={{ height: '240px', width: '100%' }}
      onMouseDown={(e) => {
        console.log('🎯🎯🎯 MOUSE DOWN EVENT for task:', task.taskId);
        e.preventDefault();
        e.stopPropagation();
        
        // Show alert first
        alert(`🎯 MOUSE DOWN: Going to Station Assignment for task ${task.taskId}`);
        
        // Navigate
        const stationUrl = `/station-assignment/${task.taskId}`;
        console.log('🎯🎯🎯 Navigating to:', stationUrl);
        window.location.href = stationUrl;
      }}
      onClick={(e) => {
        console.log('🎯🎯🎯 CLICK EVENT for task:', task.taskId);
        e.preventDefault();
        e.stopPropagation();
        
        // Show alert first
        alert(`🎯 CLICK: Going to Station Assignment for task ${task.taskId}`);
        
        // Navigate
        const stationUrl = `/station-assignment/${task.taskId}`;
        console.log('🎯🎯🎯 Navigating to:', stationUrl);
        window.location.href = stationUrl;
      }}
      onTouchStart={(e) => {
        console.log('🎯🎯🎯 TOUCH START EVENT for task:', task.taskId);
        e.preventDefault();
        e.stopPropagation();
        
        // Show alert first
        alert(`🎯 TOUCH: Going to Station Assignment for task ${task.taskId}`);
        
        // Navigate
        const stationUrl = `/station-assignment/${task.taskId}`;
        console.log('🎯🎯🎯 Navigating to:', stationUrl);
        window.location.href = stationUrl;
      }}
    >
      <div className="p-4 h-full flex flex-col bg-yellow-100">
        {/* GIANT CLICK ME BUTTON */}
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-red-600">🎯 CLICK ME! 🎯</div>
          <div className="text-lg font-bold text-blue-600">TASK {task.taskId}</div>
        </div>

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

        {/* ANOTHER CLICK INDICATOR */}
        <div className="mt-auto text-center">
          <div className="bg-red-500 text-white p-2 rounded font-bold">
            🎯 CLICK ANYWHERE ON THIS CARD! 🎯
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;