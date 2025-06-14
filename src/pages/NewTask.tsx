
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import NewTaskForm from '../components/task/NewTaskForm';
import { Program } from '../types';
import { useToast } from '../components/ui/use-toast';

const NewTask = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = (taskData: Omit<Program, 'taskId' | 'createdAt' | 'lastUpdate'>) => {
    console.log('יצירת משימה חדשה:', taskData);
    
    // Here we would normally save to backend, for now just show success
    toast({
      title: "משימה נוצרה בהצלחה",
      description: `המשימה "${taskData.title}" נוצרה ונשמרה במערכת`,
    });
    
    // Navigate back to dashboard
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <AppLayout currentRoute="/new-task">
      <div className="max-w-4xl">
        <NewTaskForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </AppLayout>
  );
};

export default NewTask;
