import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import NewTaskForm from '../components/task/NewTaskForm';
import { useToast } from '../components/ui/use-toast';

const NewTask = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = (taskData: any) => {
    console.log('משימה נוצרה:', taskData);
    
    // Stay on the same page after successful save
    // The form will handle the success message and lock the form
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <AppLayout currentRoute="/new-task">
      <NewTaskForm onSave={handleSave} onCancel={handleCancel} />
    </AppLayout>
  );
};

export default NewTask;