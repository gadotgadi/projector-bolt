import React, { useState, useMemo, useEffect } from 'react';
import { Program } from '../../types';
import { useNavigate } from 'react-router-dom';
import DashboardFilters from './DashboardFilters';
import TaskCard from './TaskCard';
import { useAuth } from '../auth/AuthProvider';
import { mockPrograms } from '../../data/mockPrograms';

interface FilterState {
  status: string[];
  assignedOfficer: string[];
  domain: string[];
  complexity: string[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    assignedOfficer: [],
    domain: [],
    complexity: []
  });
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  // Load programs from mock data
  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔥 Dashboard: טוען משימות מנתוני הדגמה:', mockPrograms);
      
      // Convert date strings to Date objects if needed
      const programsWithDates = mockPrograms.map((program: any) => ({
        ...program,
        requiredQuarter: program.requiredQuarter ? new Date(program.requiredQuarter) : null,
        startDate: program.startDate ? new Date(program.startDate) : null,
        lastUpdate: program.lastUpdate ? new Date(program.lastUpdate) : new Date(),
        createdAt: program.createdAt ? new Date(program.createdAt) : new Date(),
        requiredDate: program.requiredDate ? new Date(program.requiredDate) : null,
        completionDate: program.completionDate ? new Date(program.completionDate) : null,
        stations: program.stations?.map((station: any) => ({
          ...station,
          completionDate: station.completionDate ? new Date(station.completionDate) : null,
          lastUpdate: station.lastUpdate ? new Date(station.lastUpdate) : new Date()
        })) || []
      }));
      
      console.log('🔥 Dashboard: משימות לאחר עיבוד:', programsWithDates);
      setPrograms(programsWithDates);
    } catch (error) {
      console.error('❌ Dashboard: שגיאה בטעינת משימות:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      // Role-based filtering
      if (user?.roleCode === 3 && program.assignedOfficerName !== user.fullName) {
        return false;
      }
      if (user?.roleCode === 4 && program.requesterName !== user.fullName) {
        return false;
      }

      // Multi-selection filter-based filtering
      if (filters.status.length > 0 && !filters.status.includes(program.status)) return false;
      if (filters.assignedOfficer.length > 0 && !filters.assignedOfficer.includes(program.assignedOfficerName || '')) return false;
      if (filters.domain.length > 0 && !filters.domain.includes(program.domainName || '')) return false;
      if (filters.complexity.length > 0 && !filters.complexity.includes(program.complexity?.toString() || '')) return false;

      return true;
    });
  }, [programs, filters, user]);

  const handleProgramClick = (program: Program) => {
    console.log('🔥🔥🔥 Dashboard: נלחץ על משימה:', program.taskId);
    console.log('🔥🔥🔥 Dashboard: מנווט לנתיב:', `/station-assignment/${program.taskId}`);
    
    try {
      // Force navigation with replace to ensure it works
      window.location.href = `/station-assignment/${program.taskId}`;
    } catch (error) {
      console.error('❌ Dashboard: שגיאה בניווט:', error);
      // Fallback to regular navigation
      navigate(`/station-assignment/${program.taskId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען משימות...</p>
        </div>
      </div>
    );
  }

  console.log('🔥 Dashboard: מציג', filteredPrograms.length, 'משימות');

  return (
    <div className="space-y-6">
      {/* Filters */}
      <DashboardFilters 
        filters={filters}
        onFiltersChange={setFilters}
        programs={programs}
      />

      {/* Programs Grid - 3 columns for wider cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPrograms.map(program => {
          console.log('🔥 Dashboard: יוצר TaskCard עבור משימה:', program.taskId);
          return (
            <TaskCard 
              key={program.taskId} 
              task={program}
              onClick={() => {
                console.log('🔥🔥🔥 Dashboard: onClick callback נקרא עבור משימה:', program.taskId);
                handleProgramClick(program);
              }}
            />
          );
        })}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {programs.length === 0 ? 'אין משימות במערכת' : 'לא נמצאו משימות המתאימות לסינון'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;