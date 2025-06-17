import React from 'react';
import { Program } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🚀🚀🚀 TASKCARD V3.0 LOADED! Task:', task.taskId, 'onClick exists:', !!onClick);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔥🔥🔥 REACT ONCLICK TRIGGERED! Task ID:', task.taskId);
    console.log('🔥🔥🔥 Event details:', e.type, e.currentTarget);
    console.log('🔥🔥🔥 Current URL:', window.location.href);
    console.log('🔥🔥🔥 Target URL:', `/station-assignment/${task.taskId}`);
    
    // Show alert first
    alert(`🔥 REACT CLICK FOR TASK ${task.taskId}! 🔥`);
    
    // Try onClick callback
    if (onClick) {
      console.log('🔥🔥🔥 Calling onClick callback...');
      try {
        onClick();
        console.log('🔥🔥🔥 onClick callback SUCCESS');
      } catch (error) {
        console.error('🔥🔥🔥 onClick callback FAILED:', error);
      }
    } else {
      console.log('🔥🔥🔥 No onClick callback provided');
    }
    
    // Try direct navigation
    console.log('🔥🔥🔥 Trying direct navigation...');
    try {
      const targetUrl = `/station-assignment/${task.taskId}`;
      console.log('🔥🔥🔥 Navigating to:', targetUrl);
      window.location.href = targetUrl;
      console.log('🔥🔥🔥 Navigation command sent');
    } catch (error) {
      console.error('🔥🔥🔥 Navigation FAILED:', error);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-purple-500 rounded-lg border border-gray-300 p-4 relative cursor-pointer hover:bg-purple-600 transition-colors"
      style={{ height: '240px', width: '100%' }}
    >
      <div className="text-white font-bold text-center text-lg">
        🔥🔥🔥 CLICK ME V3! 🔥🔥🔥
      </div>
      <div className="text-white text-center text-base mt-2">
        TASK {task.taskId}
      </div>
      <div className="text-white text-center text-sm mt-2">
        {task.title}
      </div>
      <div className="text-white text-center text-xs mt-4">
        React onClick v3.0
      </div>
      <div className="text-white text-center text-xs mt-2">
        Purple = React Handler
      </div>
    </div>
  );
};

export default TaskCard;