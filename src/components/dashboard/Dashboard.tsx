
import React, { useState, useMemo } from 'react';
import { Program, currentUser } from '../../types';
import { mockPrograms } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
import DashboardFilters from './DashboardFilters';
import TaskCard from './TaskCard';

interface FilterState {
  status: string[];
  assignedOfficer: string[];
  domain: string[];
  complexity: string[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    assignedOfficer: [],
    domain: [],
    complexity: []
  });
  
  const [programs] = useState<Program[]>(mockPrograms);

  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      // Role-based filtering
      if (currentUser.role === 'procurement_officer' && program.assignedOfficerName !== currentUser.name) {
        return false;
      }
      if (currentUser.role === 'requester' && program.requesterName !== currentUser.name) {
        return false;
      }

      // Multi-selection filter-based filtering
      if (filters.status.length > 0 && !filters.status.includes(program.status)) return false;
      if (filters.assignedOfficer.length > 0 && !filters.assignedOfficer.includes(program.assignedOfficerName || '')) return false;
      if (filters.domain.length > 0 && !filters.domain.includes(program.domainName || '')) return false;
      if (filters.complexity.length > 0 && !filters.complexity.includes(program.complexity?.toString() || '')) return false;

      return true;
    });
  }, [programs, filters]);

  const handleProgramClick = (program: Program) => {
    console.log('נלחץ על משימה:', program.taskId);
    navigate(`/station-assignment/${program.taskId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-right">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">שולחן עבודה</h1>
        <p className="text-gray-600">
          ברוך הבא, {currentUser.name} | סה"כ משימות: {filteredPrograms.length}
        </p>
      </div>

      {/* Filters */}
      <DashboardFilters 
        filters={filters}
        onFiltersChange={setFilters}
        programs={programs}
      />

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPrograms.map(program => (
          <TaskCard 
            key={program.taskId} 
            task={program}
            onClick={() => handleProgramClick(program)}
          />
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">לא נמצאו משימות המתאימות לסינון</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
