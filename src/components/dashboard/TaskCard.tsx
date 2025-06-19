import React from 'react';
import { Program, STATUS_CONFIG } from '../../types';

interface TaskCardProps {
  task: Program;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'לא הוגדר';
    return new Date(date).toLocaleDateString('he-IL');
  };

  const formatQuarter = (date: Date | null | undefined) => {
    if (!date) return 'לא הוגדר';
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    const year = date.getFullYear().toString().slice(-2);
    return `Q${quarter}/${year}`;
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

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'text-blue-600';
      case 'Open': return 'text-gray-900';
      case 'Plan': return 'text-red-600';
      case 'Complete':
      case 'Done': return 'text-green-600';
      case 'Freeze':
      case 'Cancel': return 'text-gray-500';
      default: return 'text-gray-900';
    }
  };

  const calculateDaysAgo = (date: Date | null | undefined) => {
    if (!date) return 0;
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const statusConfig = getStatusConfig(task.status);
  const daysAgo = calculateDaysAgo(task.lastUpdate);

  return (
    <div 
      className="bg-white rounded-lg border border-gray-300 p-4 hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={onClick}
      style={{ minHeight: '280px' }}
    >
      {/* Header with Title and Task ID */}
      <div className="flex justify-between items-start mb-2">
        {/* Title - Large and right-aligned */}
        <div className="text-right flex-1">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {task.title}
          </h2>
        </div>
        
        {/* Task ID in top left */}
        <div className="text-left ml-4">
          <div className="text-lg font-bold text-gray-900">{task.taskId}</div>
        </div>
      </div>

      {/* Subtitle and Status */}
      <div className="flex justify-between items-start mb-6">
        {/* Subtitle - right-aligned */}
        <div className="text-right flex-1">
          <div className="text-sm text-gray-600">
            {task.description || 'אין תיאור'}
          </div>
        </div>
        
        {/* Status Badge under Task ID */}
        <div className="text-left ml-4">
          <div 
            className="px-3 py-1 rounded text-sm font-medium"
            style={{ 
              backgroundColor: statusConfig.bgColor,
              color: statusConfig.color
            }}
          >
            {statusConfig.label}
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Right Column */}
        <div className="text-right space-y-2">
          {/* Above gray line */}
          <div>
            <span className="text-gray-600">אגף: </span>
            <span className="font-medium">{task.divisionName || 'לא הוגדר'}</span>
          </div>
          <div>
            <span className="text-gray-600">דורש: </span>
            <span className="font-medium">{task.requesterName || 'לא הוגדר'}</span>
          </div>
          
          {/* Gray line separator */}
          <div className="border-t border-gray-300 my-3"></div>
          
          {/* Below gray line - with circle positioned */}
          <div className="relative">
            <div className="mb-2 pr-10">
              <span className="text-gray-600">תחום: </span>
              <span className="font-medium">{task.domainName || 'לא הוגדר'}</span>
            </div>
            <div className="mb-2 pr-10">
              <span className="text-gray-600">צוות: </span>
              <span className="font-medium">{task.teamName || 'לא הוגדר'}</span>
            </div>
            <div className="pr-10">
              <span className="text-gray-600">קניין: </span>
              <span className="font-medium">{task.assignedOfficerName || 'לא הוגדר'}</span>
            </div>
            
            {/* Blue circle positioned next to these fields */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {task.assignedOfficerName ? task.assignedOfficerName.charAt(0) : 'T'}
              </div>
            </div>
          </div>
        </div>

        {/* Left Column */}
        <div className="text-left space-y-2">
          {/* Above gray line */}
          <div>
            <span className="text-gray-600">רבעון נדרש: </span>
            <span className="font-medium">{formatQuarter(task.requiredQuarter)}</span>
          </div>
          <div>
            <span className="text-gray-600">מורכבות: </span>
            <span className="font-medium">{getComplexityLabel(task.complexity)}</span>
          </div>
          
          {/* Gray line separator */}
          <div className="border-t border-gray-300 my-3"></div>
          
          {/* Below gray line */}
          <div>
            <span className="text-gray-600">תחנה נוכחית: </span>
            <span className="font-medium">8/8</span>
          </div>
          <div>
            <span className={`font-medium ${getStatusTextColor(task.status)}`}>
              ביצוע הפעילות
            </span>
          </div>
          <div className="text-sm text-gray-600">
            עדכון אחרון: {formatDate(task.lastUpdate)} ({daysAgo})
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;