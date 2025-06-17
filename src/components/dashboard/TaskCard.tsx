import React from 'react';
import { Program } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🚀🚀🚀 TASKCARD V19.0 LOADED! Task:', task.taskId);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯🎯🎯 BUTTON CLICKED! Task:', task.taskId);
    alert(`🎯 BUTTON CLICKED: Task ${task.taskId}`);
    window.location.href = `/station-assignment/${task.taskId}`;
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('🎯 BUTTON MOUSE DOWN on task:', task.taskId);
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    console.log('🎯 BUTTON MOUSE UP on task:', task.taskId);
  };
  
  const handleMouseEnter = (e: React.MouseEvent) => {
    console.log('🎯 BUTTON MOUSE ENTER on task:', task.taskId);
  };
  
  const handleMouseLeave = (e: React.MouseEvent) => {
    console.log('🎯 BUTTON MOUSE LEAVE on task:', task.taskId);
  };
  
  return (
    <button 
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        height: '240px', 
        width: '100%',
        backgroundColor: '#00ff00',
        border: '5px solid #0000ff',
        borderRadius: '10px',
        padding: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
        pointerEvents: 'auto'
      }}
    >
      <div style={{
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#000000',
        pointerEvents: 'none' // Prevent child from interfering
      }}>
        🎯 BUTTON CLICK ME! 🎯<br/>
        TASK {task.taskId}<br/>
        {task.title}
      </div>
    </button>
  );
};

export default TaskCard;