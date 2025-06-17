import React from 'react';
import { Program, STATUS_CONFIG } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🔥 TaskCard רנדר עבור משימה:', task.taskId, 'עם onClick:', !!onClick);
  
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

  // פונקציה פשוטה ללחיצה על הכרטיס
  const handleCardClick = () => {
    console.log('🚀🚀🚀 CARD CLICKED - משימה:', task.taskId);
    console.log('🚀🚀🚀 onClick function available:', !!onClick);
    
    if (onClick) {
      console.log('🚀🚀🚀 Calling onClick function...');
      onClick();
    } else {
      console.log('❌❌❌ No onClick function provided!');
    }
  };

  const handleDebugClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🚀 DEBUG BUTTON CLICKED for task:', task.taskId);
    alert(`Debug click for task ${task.taskId}`);
    if (onClick) {
      onClick();
    }
  };

  return (
    <div style={{ position: 'relative', height: '240px', width: '100%' }}>
      {/* DEBUG BUTTON - זמני לבדיקה */}
      <button
        onClick={handleDebugClick}
        style={{
          position: 'absolute',
          top: '5px',
          left: '5px',
          backgroundColor: 'red',
          color: 'white',
          padding: '5px 10px',
          border: 'none',
          borderRadius: '3px',
          fontSize: '12px',
          zIndex: 1000,
          cursor: 'pointer'
        }}
      >
        DEBUG {task.taskId}
      </button>

      {/* הכרטיס עצמו */}
      <div 
        onClick={handleCardClick}
        onMouseEnter={() => console.log('🔥 Mouse entered card:', task.taskId)}
        onMouseLeave={() => console.log('🔥 Mouse left card:', task.taskId)}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          padding: '16px',
          cursor: 'pointer',
          height: '100%',
          width: '100%',
          transition: 'all 0.2s',
          position: 'relative'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = '';
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {/* Header Row - Title with Task ID, Description with Status */}
        <div style={{ marginBottom: '16px' }}>
          {/* Title and Task ID Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '16px', lineHeight: '1.25' }}>
              {task.title}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>
              {task.taskId}
            </div>
          </div>
          
          {/* Description and Status Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ color: '#4b5563', fontSize: '14px', flex: 1 }}>
              {task.description || 'התקשרות עם חברה נתונה בנושא ביצוע בעברית'}
            </div>
            <div 
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                color: 'black',
                backgroundColor: statusConfig.bgColor,
                marginLeft: '8px'
              }}
            >
              {statusConfig.label}
            </div>
          </div>
        </div>

        {/* Middle Row - Quarter & Complexity (left), Requester & Division (right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '14px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#4b5563' }}>רבעון נדרש: </span>
              <span style={{ fontWeight: '500' }}>Q1/26</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#4b5563' }}>מורכבות: </span>
              <span style={{ fontWeight: '500' }}>{getComplexityText(task.complexity)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#4b5563' }}>אגף: </span>
              <span style={{ fontWeight: '500' }}>{task.divisionName || 'לוגיסטיקה'}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#4b5563' }}>דורש: </span>
              <span style={{ fontWeight: '500' }}>{task.requesterName || 'שמעון לביא'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '14px' }}>
          {/* Left Side - Stations Progress */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#4b5563' }}>תחנה נוכחית: </span>
              <span style={{ fontWeight: '500' }}>{completedStations}/{totalStations}</span>
            </div>
            {progressDisplay && (
              <div style={{ marginBottom: '4px' }} className={progressDisplay.color}>
                <span style={{ fontWeight: '500' }}>{progressDisplay.text}</span>
              </div>
            )}
            {task.status !== 'Open' && (
              <div style={{ color: '#4b5563', fontSize: '12px' }}>
                עדכון אחרון: {formatDate(lastCompletedDate)} ({daysAgo})
              </div>
            )}
          </div>

          {/* Right Side - Domain, Team, Officer */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#4b5563' }}>תחום: </span>
              <span style={{ fontWeight: '500' }}>{task.domainName || 'רכש לוגיסטי'}</span>
            </div>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#4b5563' }}>צוות: </span>
              <span style={{ fontWeight: '500' }}>{task.teamName || 'תפעול ורכב'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
              <span style={{ color: '#4b5563' }}>קניין: </span>
              <span style={{ fontWeight: '500' }}>{task.assignedOfficerName || 'רבקה דקל'}</span>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {getInitials(task.assignedOfficerName || 'רבקה דקל')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;