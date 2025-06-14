
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import NewTaskForm from '../components/task/NewTaskForm';
import { Program } from '../types';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            חזרה לשולחן העבודה
          </Button>
          <h1 className="text-2xl font-bold">דרישה חדשה</h1>
        </div>

        {/* Form */}
        <div className="max-w-4xl">
          <NewTaskForm onSave={handleSave} onCancel={handleCancel} />
        </div>
      </div>
    </AppLayout>
  );
};

export default NewTask;
