import React from 'react';
import { Program } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🚀🚀🚀 TASKCARD V5.0 LOADED! Task:', task.taskId, 'onClick exists:', !!onClick);
  
  return (
    <div 
      className="bg-purple-500 rounded-lg border border-gray-300 p-4 relative"
      style={{ 
        height: '240px', 
        width: '100%',
        pointerEvents: 'auto',
        zIndex: 10
      }}
    >
      <div className="text-white font-bold text-center text-lg">
        🚀 TASKCARD V5.0 🚀
      </div>
      <div className="text-white text-center text-base mt-2">
        TASK {task.taskId}
      </div>
      
      {/* כפתור פשוט עם onMouseDown */}
      <button
        onMouseDown={(e) => {
          console.log('🎯 MOUSE DOWN!', task.taskId);
          alert(`MOUSE DOWN ${task.taskId}`);
        }}
        onClick={(e) => {
          console.log('🎯 CLICK!', task.taskId);
          alert(`CLICK ${task.taskId}`);
        }}
        onTouchStart={(e) => {
          console.log('🎯 TOUCH!', task.taskId);
          alert(`TOUCH ${task.taskId}`);
        }}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded mt-4 mx-auto block text-xl"
        style={{ 
          pointerEvents: 'auto',
          zIndex: 20,
          position: 'relative'
        }}
      >
        🎯 TEST BUTTON 🎯
      </button>
      
      <div className="text-white text-center text-xs mt-2">
        Purple Card V5.0
      </div>
    </div>
  );
};

export default TaskCard;