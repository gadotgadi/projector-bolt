import React, { useEffect, useRef } from 'react';
import { Program, STATUS_CONFIG } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  console.log('🚀🚀🚀 NEW TASKCARD VERSION 2.0 LOADED! Task:', task.taskId, 'onClick exists:', !!onClick);
  
  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    const handleClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🔥🔥🔥🔥🔥 DIRECT EVENT LISTENER CLICKED! Task ID:', task.taskId);
      console.log('🔥🔥🔥 Current window location:', window.location.href);
      console.log('🔥🔥🔥 Target URL:', `/station-assignment/${task.taskId}`);
      
      // Show alert first
      alert(`🔥 DIRECT CLICK FOR TASK ${task.taskId}! 🔥`);
      
      // Try onClick callback
      if (onClick) {
        console.log('🔥🔥🔥 Calling onClick callback...');
        try {
          onClick();
          console.log('🔥🔥🔥 onClick callback SUCCESS');
        } catch (error) {
          console.error('🔥🔥🔥 onClick callback FAILED:', error);
        }
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

    // Add multiple event listeners
    cardElement.addEventListener('click', handleClick);
    cardElement.addEventListener('mousedown', handleClick);
    cardElement.addEventListener('touchstart', handleClick);
    
    console.log('🔥 Event listeners added to card for task:', task.taskId);

    return () => {
      cardElement.removeEventListener('click', handleClick);
      cardElement.removeEventListener('mousedown', handleClick);
      cardElement.removeEventListener('touchstart', handleClick);
    };
  }, [task.taskId, onClick]);

  return (
    <div 
      ref={cardRef}
      className="bg-green-500 rounded-lg border border-gray-300 p-4 relative cursor-pointer hover:bg-green-600 transition-colors"
      style={{ height: '240px', width: '100%' }}
    >
      <div className="text-white font-bold text-center text-lg">
        🔥🔥🔥 CLICK ME! 🔥🔥🔥
      </div>
      <div className="text-white text-center text-base mt-2">
        TASK {task.taskId}
      </div>
      <div className="text-white text-center text-sm mt-2">
        {task.title}
      </div>
      <div className="text-white text-center text-xs mt-4">
        Direct Event Listeners v2.0
      </div>
    </div>
  );
};

export default TaskCard;