import React from 'react';
import { Program, STATUS_CONFIG } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🚀🚀🚀 NEW TASKCARD VERSION LOADED! Task:', task.taskId, 'onClick exists:', !!onClick);
  
  const statusConfig = STATUS_CONFIG[task.status];
  
  const formatDate = (date?: Date) => {
    if (!date) return '--';
    return date.toLocaleDateString('he-IL');
  };

  const getComplexityText = (complexity?: number) => {
    if (!complexity) return 'פשוט';
    const levels = { 1: 'פשוט', 2: 'בינוני', 3: 'מורכב' };
    return levels[complexity as keyof typeof levels] || 'פשוט';
  };

  // Mock data for stations and progress
  const totalStations = 8;
  const completedStations = 8;
  const lastCompletedDate = new Date('2025-02-13');
  const daysAgo = Math.floor((new Date().getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Get initials for officer
  const getInitials = (name?: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get progress display based on status
  const getProgressDisplay = () => {
    switch (task.status) {
      case 'In Progress':
        return {
          text: 'ביצוע החטיים',
          color: 'text-blue-600'
        };
      case 'Open':
        return null; // No display
      case 'Plan':
        return {
          text: `מועד התנעה: ${formatDate(task.requiredQuarter)}`,
          color: 'text-red-600'
        };
      case 'Complete':
      case 'Done':
        return {
          text: 'ביצוע הסתיים',
          color: 'text-green-600'
        };
      case 'Freeze':
      case 'Cancel':
        // Check if there's any progress, otherwise show "טרם החל"
        const hasProgress = completedStations > 0;
        return {
          text: hasProgress ? 'ביצוע החטיים' : 'טרם החל',
          color: 'text-gray-500'
        };
      default:
        return null;
    }
  };

  const progressDisplay = getProgressDisplay();

  // SUPER ENHANCED TEST FUNCTION
  const handleSuperClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔥🔥🔥🔥🔥 SUPER BUTTON CLICKED! Task ID:', task.taskId);
    console.log('🔥🔥🔥 Current window location:', window.location.href);
    console.log('🔥🔥🔥 Target URL:', `/station-assignment/${task.taskId}`);
    console.log('🔥🔥🔥 onClick function exists:', !!onClick);
    console.log('🔥🔥🔥 onClick function:', onClick);
    
    // Show alert first
    alert(`🔥 SUPER CLICK FOR TASK ${task.taskId}! 🔥`);
    
    // Try multiple navigation methods
    console.log('🔥🔥🔥 Trying method 1: onClick callback...');
    if (onClick) {
      try {
        onClick();
        console.log('🔥🔥🔥 Method 1 SUCCESS: onClick called');
      } catch (error) {
        console.error('🔥🔥🔥 Method 1 FAILED:', error);
      }
    } else {
      console.log('🔥🔥🔥 Method 1 SKIPPED: No onClick function');
    }
    
    // Try direct window.location
    console.log('🔥🔥🔥 Trying method 2: window.location.href...');
    try {
      const targetUrl = `/station-assignment/${task.taskId}`;
      console.log('🔥🔥🔥 Setting window.location.href to:', targetUrl);
      window.location.href = targetUrl;
      console.log('🔥🔥🔥 Method 2 SUCCESS: window.location.href set');
    } catch (error) {
      console.error('🔥🔥🔥 Method 2 FAILED:', error);
    }
    
    // Try window.location.assign
    console.log('🔥🔥🔥 Trying method 3: window.location.assign...');
    try {
      const targetUrl = `/station-assignment/${task.taskId}`;
      window.location.assign(targetUrl);
      console.log('🔥🔥🔥 Method 3 SUCCESS: window.location.assign called');
    } catch (error) {
      console.error('🔥🔥🔥 Method 3 FAILED:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-4 relative" style={{ height: '240px', width: '100%' }}>
      {/* SUPER ENHANCED TEST BUTTON - TAKES FULL CARD */}
      <button
        onClick={handleSuperClick}
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          width: '100%',
          height: '100%',
          backgroundColor: '#10B981',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '18px',
          border: 'none',
          cursor: 'pointer',
          zIndex: 9999,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <div>🔥🔥🔥 SUPER CLICK TEST 🔥🔥🔥</div>
        <div>TASK {task.taskId}</div>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>
          {task.title}
        </div>
      </button>
    </div>
  );
};

export default TaskCard;