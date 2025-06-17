import React from 'react';
import { Program, STATUS_CONFIG } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🚀🚀🚀 TASKCARD V16.0 LOADED! Task:', task.taskId, 'onClick exists:', !!onClick);
  
  const statusConfig = STATUS_CONFIG[task.status];
  
  const handleCardClick = () => {
    console.log('🎯🎯🎯 CARD CLICKED! Task:', task.taskId);
    alert(`🎯 CARD CLICKED: Going to Station Assignment for task ${task.taskId}`);
    
    // Use window.location.href for direct navigation
    const stationUrl = `/station-assignment/${task.taskId}`;
    console.log('🎯🎯🎯 Navigating to:', stationUrl);
    window.location.href = stationUrl;
  };
  
  return (
    <div 
      className="bg-white rounded-lg border-4 border-red-500 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
      style={{ height: '240px', width: '100%' }}
    >
      <div className="p-4 h-full flex flex-col bg-yellow-100">
        {/* GIANT CLICK BUTTON */}
        <button
          onClick={handleCardClick}
          className="w-full h-full bg-red-500 hover:bg-red-600 text-white font-bold text-xl rounded-lg border-4 border-yellow-400"
          style={{ minHeight: '200px' }}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🎯 CLICK ME! 🎯</div>
            <div className="text-2xl mb-2">TASK {task.taskId}</div>
            <div className="text-lg">{task.title}</div>
            <div className="text-base mt-4 bg-yellow-400 text-black p-2 rounded">
              CLICK THIS ENTIRE BUTTON!
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default TaskCard;