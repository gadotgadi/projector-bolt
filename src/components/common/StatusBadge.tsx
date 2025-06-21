import React from 'react';
import { TaskStatus, STATUS_CONFIG } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const statusConfig = STATUS_CONFIG[status];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm', 
    lg: 'px-4 py-2 text-lg font-bold'
  };

  return (
    <span 
      className={`${sizeClasses[size]} rounded-full font-medium border`}
      style={{ 
        backgroundColor: statusConfig.bgColor,
        color: statusConfig.color,
        borderColor: statusConfig.color + '40'
      }}
    >
      {statusConfig.label}
    </span>
  );
};

export default StatusBadge;