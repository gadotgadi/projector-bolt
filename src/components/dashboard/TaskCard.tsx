import React from 'react';
import { Program, STATUS_CONFIG } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🚀🚀🚀 TASKCARD V8.0 LOADED! Task:', task.taskId, 'onClick exists:', !!onClick);
  
  const statusConfig = STATUS_CONFIG[task.status];
  
  const navigateToTask = () => {
    console.log('🎯 DIRECT NAVIGATION to task:', task.taskId);
    const targetUrl = `/station-assignment/${task.taskId}`;
    console.log('🎯 Target URL:', targetUrl);
    
    // Try multiple navigation methods
    try {
      // Method 1: Direct window location
      window.location.href = targetUrl;
      console.log('🎯 Navigation method 1 executed');
    } catch (error) {
      console.error('🎯 Navigation method 1 failed:', error);
      
      try {
        // Method 2: Window location assign
        window.location.assign(targetUrl);
        console.log('🎯 Navigation method 2 executed');
      } catch (error2) {
        console.error('🎯 Navigation method 2 failed:', error2);
        
        // Method 3: Alert as fallback
        alert(`Navigation to ${targetUrl}`);
      }
    }
  };
  
  return (
    <div 
      className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg border-2 border-yellow-400 p-4 relative cursor-pointer hover:shadow-2xl transition-all transform hover:scale-105"
      style={{ 
        height: '240px', 
        width: '100%',
        zIndex: 1000
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎯 MOUSE DOWN V8.0 on task:', task.taskId);
        navigateToTask();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎯 CLICK V8.0 on task:', task.taskId);
        navigateToTask();
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎯 TOUCH START V8.0 on task:', task.taskId);
        navigateToTask();
      }}
    >
      {/* Giant Click Me Button */}
      <div className="text-center text-white font-bold text-2xl mb-4">
        🎯 CLICK ME! 🎯
      </div>
      
      {/* Task Info */}
      <div className="text-center text-white text-lg font-bold mb-2">
        TASK #{task.taskId}
      </div>
      
      <div className="text-center text-white text-base mb-2">
        {task.title}
      </div>
      
      <div className="text-center text-yellow-200 text-sm mb-4">
        Status: {statusConfig.label}
      </div>
      
      {/* Navigation Info */}
      <div className="text-center text-white text-xs">
        Will navigate to: /station-assignment/{task.taskId}
      </div>
      
      {/* Extra click areas */}
      <div 
        className="absolute inset-0 bg-transparent"
        onMouseDown={navigateToTask}
        onClick={navigateToTask}
        onTouchStart={navigateToTask}
      />
    </div>
  );
};

export default TaskCard;