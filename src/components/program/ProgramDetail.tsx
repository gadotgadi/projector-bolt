
import React, { useState } from 'react';
import { Program, currentUser } from '../../types';
import { Button } from '../ui/button';
import { Edit2, ArrowRight } from 'lucide-react';
import ProgramForm from './ProgramForm';
import StationsProgress from './StationsProgress';
import { useToast } from '../ui/use-toast';

interface ProgramDetailProps {
  program: Program;
  onBack: () => void;
  onProgramUpdate: (program: Program) => void;
}

const ProgramDetail: React.FC<ProgramDetailProps> = ({ program, onBack, onProgramUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSave = (updatedProgram: Program) => {
    onProgramUpdate(updatedProgram);
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
                  (currentUser.role === 'procurement_officer' && program.assignedOfficerName === currentUser.name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            חזרה לשולחן העבודה
          </Button>
          <h1 className="text-2xl font-bold">משימה #{program.taskId}</h1>
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
        {/* Program Form - takes up 2 columns */}
        <div className="lg:col-span-2">
          <ProgramForm 
            program={program}
            canEdit={canEdit}
            onProgramUpdate={onProgramUpdate}
            isEditing={isEditing}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>

        {/* Stations Progress - takes up 1 column */}
        <div>
          <StationsProgress 
            program={program} 
            onProgramUpdate={onProgramUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgramDetail;
