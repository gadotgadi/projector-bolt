import React from 'react';
import { Program, STATUS_CONFIG } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  console.log('🚀 TaskCard רנדר עבור משימה:', task.taskId, 'עם onClick:', !!onClick);
  
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

  // Enhanced navigation function with detailed logging
  const testNavigation = () => {
    console.log('🚀🚀🚀 NAVIGATION TEST STARTED for task:', task.taskId);
    
    // Test 1: Alert to confirm button works
    alert(`Navigation test for task ${task.taskId} - Button clicked successfully!`);
    
    // Test 2: Try onClick callback if provided
    if (onClick) {
      console.log('🚀 Calling onClick callback...');
      try {
        onClick();
        console.log('🚀 onClick callback completed successfully');
      } catch (error) {
        console.error('❌ onClick callback failed:', error);
        alert('onClick callback failed: ' + error);
      }
    } else {
      console.log('❌ No onClick callback provided');
      alert('No onClick callback provided to TaskCard');
    }
    
    // Test 3: Try direct window navigation
    console.log('🚀 Attempting direct window navigation...');
    try {
      const targetUrl = `/station-assignment/${task.taskId}`;
      console.log('🚀 Target URL:', targetUrl);
      
      // Try window.location.href
      window.location.href = targetUrl;
      console.log('🚀 window.location.href set successfully');
    } catch (error) {
      console.error('❌ Direct navigation failed:', error);
      alert('Direct navigation failed: ' + error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-4 relative" style={{ height: '240px', width: '100%' }}>
      {/* ENHANCED TEST BUTTON */}
      <div className="absolute top-2 left-2 right-2 z-50">
        <button
          onClick={testNavigation}
          style={{
            width: '100%',
            backgroundColor: '#10B981',
            color: 'white',
            fontWeight: 'bold',
            padding: '12px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔧 NAVIGATE TO TASK {task.taskId} 🔧
        </button>
      </div>

      {/* Original content - moved down */}
      <div className="mt-20">
        {/* Header Row - Title with Task ID, Description with Status */}
        <div className="mb-4">
          {/* Title and Task ID Row */}
          <div className="flex justify-between items-start mb-2">
            <div className="font-bold text-gray-800 text-base leading-tight">
              {task.title}
            </div>
            <div className="text-sm font-bold text-gray-800">
              {task.taskId}
            </div>
          </div>
          
          {/* Description and Status Row */}
          <div className="flex justify-between items-start">
            <div className="text-gray-600 text-sm flex-1">
              {task.description || 'התקשרות עם חברה נתונה בנושא ביצוע בעברית'}
            </div>
            <div 
              className="px-2 py-1 rounded-md text-xs font-medium text-black ml-2"
              style={{ backgroundColor: statusConfig.bgColor }}
            >
              {statusConfig.label}
            </div>
          </div>
        </div>

        {/* Middle Row - Quarter & Complexity (left), Requester & Division (right) */}
        <div className="flex justify-between items-center mb-4 text-sm">
          <div className="flex gap-4">
            <div className="text-right">
              <span className="text-gray-600">רבעון נדרש: </span>
              <span className="font-medium">Q1/26</span>
            </div>
            <div className="text-right">
              <span className="text-gray-600">מורכבות: </span>
              <span className="font-medium">{getComplexityText(task.complexity)}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <span className="text-gray-600">אגף: </span>
              <span className="font-medium">{task.divisionName || 'לוגיסטיקה'}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-600">דורש: </span>
              <span className="font-medium">{task.requesterName || 'שמעון לביא'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex justify-between items-start text-sm">
          {/* Left Side - Stations Progress */}
          <div className="text-right">
            <div className="mb-1">
              <span className="text-gray-600">תחנה נוכחית: </span>
              <span className="font-medium">{completedStations}/{totalStations}</span>
            </div>
            {progressDisplay && (
              <div className={`${progressDisplay.color} font-medium mb-1`}>
                {progressDisplay.text}
              </div>
            )}
            {task.status !== 'Open' && (
              <div className="text-gray-600 text-xs">
                עדכון אחרון: {formatDate(lastCompletedDate)} ({daysAgo})
              </div>
            )}
          </div>

          {/* Right Side - Domain, Team, Officer */}
          <div className="text-right">
            <div className="mb-1">
              <span className="text-gray-600">תחום: </span>
              <span className="font-medium">{task.domainName || 'רכש לוגיסטי'}</span>
            </div>
            <div className="mb-1">
              <span className="text-gray-600">צוות: </span>
              <span className="font-medium">{task.teamName || 'תפעול ורכב'}</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-gray-600">קניין: </span>
              <span className="font-medium">{task.assignedOfficerName || 'רבקה דקל'}</span>
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
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