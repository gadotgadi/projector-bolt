
import React, { useState } from 'react';
import { Program, currentUser } from '../../types';
import { Button } from '../ui/button';
import { Edit2, ArrowRight } from 'lucide-react';
import TaskForm from './TaskForm';
import TaskProgress from './TaskProgress';
import { useToast } from '../ui/use-toast';

interface TaskDetailProps {
  task: Program;
  onBack: () => void;
  onTaskUpdate: (task: Program) => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onBack, onTaskUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSave = (updatedTask: Program) => {
    onTaskUpdate(updatedTask);
    setIsEditing(false);
    toast({
      title: "משימה עודכנה",
      description: "פרטי המשימה נשמרו בהצלחה",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const canEdit = currentUser.role === 'procurement_manager' || 
                  currentUser.role === 'team_leader' ||
                  (currentUser.role === 'procurement_officer' && task.assignedOfficerName === currentUser.name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            חזרה לשולחן העבודה
          </Button>
        </div>
        
        {canEdit && !isEditing && (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit2 className="w-4 h-4" />
            עריכה
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Form - takes up 2 columns */}
        <div className="lg:col-span-2">
          <TaskForm 
            task={task} 
            isEditing={isEditing}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>

        {/* Progress Tracking - takes up 1 column */}
        <div>
          <TaskProgress task={task} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
