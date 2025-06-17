import React from 'react';
import { Program } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🚀🚀🚀 TASKCARD V17.0 LOADED! Task:', task.taskId);
  
  return (
    <div 
      style={{ 
        height: '240px', 
        width: '100%',
        backgroundColor: '#ff0000',
        border: '5px solid #ffff00',
        borderRadius: '10px',
        padding: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={() => {
        console.log('🎯🎯🎯 DIV CLICKED! Task:', task.taskId);
        alert(`🎯 DIV CLICKED: Task ${task.taskId}`);
        window.location.href = `/station-assignment/${task.taskId}`;
      }}
      onMouseDown={() => console.log('🎯 MOUSE DOWN on task:', task.taskId)}
      onMouseUp={() => console.log('🎯 MOUSE UP on task:', task.taskId)}
      onMouseEnter={() => console.log('🎯 MOUSE ENTER on task:', task.taskId)}
      onMouseLeave={() => console.log('🎯 MOUSE LEAVE on task:', task.taskId)}
    >
      <div style={{
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#000000'
      }}>
        🎯 CLICK ME! 🎯<br/>
        TASK {task.taskId}<br/>
        {task.title}
      </div>
    </div>
  );
};

export default TaskCard;