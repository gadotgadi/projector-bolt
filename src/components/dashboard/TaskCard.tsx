import React from 'react';
import { Program, STATUS_CONFIG } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'לא הוגדר';
    return new Date(date).toLocaleDateString('he-IL');
  };

  const getComplexityLabel = (complexity?: number) => {
    switch (complexity) {
      case 1: return 'פשוט';
      case 2: return 'בינוני';
      case 3: return 'מורכב';
      default: return 'לא הוגדר';
    }
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.Open;
  };

  const statusConfig = getStatusConfig(task.status);

  return (
    <div 
      className="bg-white rounded-lg border border-gray-300 p-4 hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={handleClick}
      style={{ minHeight: '280px' }}
    >
      {/* Header with Task ID and Status */}
      <div className="flex justify-between items-center mb-4">
        {/* Task ID on the left */}
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{task.taskId}</div>
        </div>
        
        {/* Status badge on the right */}
        <div 
          className="px-3 py-1 rounded text-sm font-medium"
          style={{ 
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.color
          }}
        >
          פתוח
        </div>
      </div>

      {/* Title - Large and centered */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 leading-tight">
          הסכם ביצוע הכשרות בטיחות<br />
          לנהגים ומפעילי ציוד כבד
        </h2>
        <div className="text-sm text-gray-600 mt-2">
          התקשרות עם חברה מתמחה בנושא בטיחות<br />
          בעבודה
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Right Column */}
        <div className="text-right space-y-3">
          <div>
            <span className="text-gray-600">אגף: </span>
            <span className="font-medium">לוגיסטיקה</span>
          </div>
          <div>
            <span className="text-gray-600">דורש: </span>
            <span className="font-medium">שמעון לביא</span>
          </div>
          <div>
            <span className="text-gray-600">תחום: </span>
            <span className="font-medium">רכש לוגיסטי</span>
          </div>
          <div>
            <span className="text-gray-600">קניין: </span>
            <span className="font-medium">רבקה דקל</span>
          </div>
        </div>

        {/* Left Column */}
        <div className="text-left space-y-3">
          <div>
            <span className="text-gray-600">רבעון נדרש: </span>
            <span className="font-medium">Q1/26</span>
          </div>
          <div>
            <span className="text-gray-600">מורכבות: </span>
            <span className="font-medium">פשוט</span>
          </div>
          <div>
            <span className="text-gray-600">תחנה נוכחית: </span>
            <span className="font-medium">8/8</span>
          </div>
          <div>
            <span className="text-gray-600">צוות: </span>
            <span className="font-medium">תפעול ורכב</span>
          </div>
        </div>
      </div>

      {/* Bottom section - Execution status */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <div className="text-green-600 font-medium mb-1">ביצוע הפעילות</div>
        <div className="text-sm text-gray-600">
          (77) 13/2/2025 :עדכון אחרון
        </div>
        
        {/* Blue circle with T1 */}
        <div className="absolute bottom-0 left-0">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            T1
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;