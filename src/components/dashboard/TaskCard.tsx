import React from 'react';
import { Program } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🚀🚀🚀 TASKCARD V4.0 LOADED! Task:', task.taskId, 'onClick exists:', !!onClick);
  
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔥🔥🔥 CARD CLICK TRIGGERED! Task ID:', task.taskId);
    alert(`🔥 CARD CLICK FOR TASK ${task.taskId}! 🔥`);
    
    if (onClick) {
      onClick();
    }
    
    window.location.href = `/station-assignment/${task.taskId}`;
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯🎯🎯 BUTTON CLICK TRIGGERED! Task ID:', task.taskId);
    alert(`🎯 BUTTON CLICK FOR TASK ${task.taskId}! 🎯`);
    
    if (onClick) {
      onClick();
    }
    
    window.location.href = `/station-assignment/${task.taskId}`;
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-red-500 rounded-lg border border-gray-300 p-4 relative cursor-pointer hover:bg-red-600 transition-colors"
      style={{ height: '240px', width: '100%' }}
    >
      <div className="text-white font-bold text-center text-lg">
        🔥🔥🔥 CLICK CARD V4! 🔥🔥🔥
      </div>
      <div className="text-white text-center text-base mt-2">
        TASK {task.taskId}
      </div>
      <div className="text-white text-center text-sm mt-2">
        {task.title}
      </div>
      
      {/* כפתור נפרד שיעבוד בוודאות */}
      <button
        onClick={handleButtonClick}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded mt-4 mx-auto block"
      >
        🎯 CLICK BUTTON 🎯
      </button>
      
      <div className="text-white text-center text-xs mt-2">
        Red Card + Yellow Button
      </div>
    </div>
  );
};

export default TaskCard;