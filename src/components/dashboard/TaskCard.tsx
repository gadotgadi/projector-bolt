import React from 'react';
import { Program, STATUS_CONFIG } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🚀🚀🚀 TASKCARD V9.0 LOADED! Task:', task.taskId, 'onClick exists:', !!onClick);
  
  const statusConfig = STATUS_CONFIG[task.status];
  
  const navigateToTask = () => {
    console.log('🎯🎯🎯 NAVIGATION TRIGGERED for task:', task.taskId);
    const targetUrl = `/station-assignment/${task.taskId}`;
    console.log('🎯🎯🎯 Target URL:', targetUrl);
    
    // Show alert first to confirm click is working
    alert(`🎯 CLICK DETECTED! Navigating to task ${task.taskId}`);
    
    // Then navigate
    try {
      window.location.href = targetUrl;
      console.log('🎯🎯🎯 Navigation executed');
    } catch (error) {
      console.error('🎯🎯🎯 Navigation failed:', error);
    }
  };
  
  return (
    <div 
      className="bg-red-500 rounded-lg border-4 border-yellow-400 p-4 relative"
      style={{ 
        height: '280px', 
        width: '100%',
        zIndex: 1000
      }}
    >
      {/* Giant HTML Button */}
      <button
        type="button"
        onClick={navigateToTask}
        onMouseDown={navigateToTask}
        className="w-full h-full bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded border-2 border-white cursor-pointer"
        style={{ minHeight: '250px' }}
      >
        <div className="text-center">
          <div className="text-3xl mb-4">🎯 CLICK HERE! 🎯</div>
          <div className="text-xl mb-2">TASK #{task.taskId}</div>
          <div className="text-lg mb-2">{task.title}</div>
          <div className="text-base">Status: {statusConfig.label}</div>
          <div className="text-sm mt-4">HTML BUTTON TEST</div>
        </div>
      </button>
      
      {/* Backup div with inline onclick */}
      <div 
        className="absolute top-2 right-2 bg-yellow-500 text-black p-2 rounded cursor-pointer"
        onClick={() => {
          console.log('🎯🎯🎯 BACKUP DIV CLICKED!');
          alert('BACKUP CLICK WORKS!');
          navigateToTask();
        }}
      >
        BACKUP
      </div>
    </div>
  );
};

export default TaskCard;