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
      style={{ minHeight: '240px' }}
    >
      {/* Top Row - Task ID and Status */}
      <div className="flex justify-between items-start mb-3">
        <div className="text-left">
          <div className="text-sm font-bold text-gray-900">קוד משימה</div>
          <div className="text-lg font-bold">{task.taskId}</div>
        </div>
        <div className="text-center">
          <div 
            className="px-3 py-1 rounded text-sm font-medium border"
            style={{ 
              backgroundColor: statusConfig.bgColor,
              color: statusConfig.color,
              borderColor: statusConfig.color + '40'
            }}
          >
            {statusConfig.label}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="font-bold text-lg text-gray-900 leading-tight">{task.title}</h3>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {/* Right Column */}
        <div className="text-right space-y-2">
          <div>
            <div className="text-gray-500 text-xs">אגף:</div>
            <div className="font-medium">{task.divisionName}</div>
          </div>
          
          <div>
            <div className="text-gray-500 text-xs">דורש:</div>
            <div className="font-medium">{task.requesterName}</div>
          </div>

          <div>
            <div className="text-gray-500 text-xs">תחום:</div>
            <div className="font-medium">{task.domainName || 'לא הוגדר'}</div>
          </div>

          <div>
            <div className="text-gray-500 text-xs">קניין:</div>
            <div className="font-medium">{task.assignedOfficerName || 'לא שובץ'}</div>
          </div>
        </div>

        {/* Left Column */}
        <div className="text-left space-y-2">
          <div>
            <div className="text-gray-500 text-xs">לוגיסטיקה</div>
            <div className="font-medium">{task.departmentName || 'כללי'}</div>
          </div>

          <div>
            <div className="text-gray-500 text-xs">רבעון נדרש:</div>
            <div className="font-medium">{formatDate(task.requiredQuarter)}</div>
          </div>

          <div>
            <div className="text-gray-500 text-xs">מורכבות:</div>
            <div className="font-medium">{getComplexityLabel(task.complexity)}</div>
          </div>

          <div>
            <div className="text-gray-500 text-xs">רכש לוגיסטי</div>
            <div className="font-medium">צוות רכב</div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Execution Status */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">ביצוע הפעילות</div>
          <div className="text-sm font-medium text-green-600">
            {task.status === 'In Progress' ? `(${Math.floor(Math.random() * 10) + 1}) ${formatDate(task.lastUpdate)}` : 
             task.status === 'Complete' || task.status === 'Done' ? 'הושלם' :
             'טרם החל'}
          </div>
        </div>

        {/* Progress indicator for status explanation */}
        <div className="mt-2 text-xs text-center text-gray-400">
          {task.status === 'Open' && 'שדה "עדכון אחרון למשימה" מסוגלת Program. מעודכן אחרון עם רגיש.'}
          {task.status === 'Plan' && 'יש פעילויות אחרונות משובצות. מעודכן אחרון עם רגיש.'}
          {task.status === 'In Progress' && 'פונה כחול.'}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;