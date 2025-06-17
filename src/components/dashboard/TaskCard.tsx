import React from 'react';
import { Program } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🚀🚀🚀 TASKCARD V18.0 LOADED! Task:', task.taskId);
  
  const handleClick = () => {
    console.log('🎯🎯🎯 BUTTON CLICKED! Task:', task.taskId);
    alert(`🎯 BUTTON CLICKED: Task ${task.taskId}`);
    window.location.href = `/station-assignment/${task.taskId}`;
  };
  
  return (
    <button 
      onClick={handleClick}
      onMouseDown={() => console.log('🎯 BUTTON MOUSE DOWN on task:', task.taskId)}
      onMouseUp={() => console.log('🎯 BUTTON MOUSE UP on task:', task.taskId)}
      onMouseEnter={() => console.log('🎯 BUTTON MOUSE ENTER on task:', task.taskId)}
      onMouseLeave={() => console.log('🎯 BUTTON MOUSE LEAVE on task:', task.taskId)}
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
        justifyContent: 'center'
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