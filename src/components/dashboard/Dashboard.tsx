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
  requester: string[];
  team: string[];
  quarter: string[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    assignedOfficer: [],
    domain: [],
    complexity: [],
    requester: [],
    team: [],
    quarter: []
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
      
      setPrograms(programsWithDates);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get default status filter based on user role
  const getDefaultStatusFilter = () => {
    if (user?.roleCode === 3) { // קניין
      return ['Plan', 'In Progress', 'Complete'];
    } else if (user?.roleCode === 2) { // ראש צוות
      return ['Plan', 'In Progress', 'Complete'];
    } else {
      // For all other users, exclude Freeze and Cancel by default
      return ['Open', 'Plan', 'In Progress', 'Complete', 'Done'];
    }
  };

  // Initialize default filters based on user role
  useEffect(() => {
    if (user) {
      setFilters(prev => ({
        ...prev,
        status: getDefaultStatusFilter()
      }));
    }
  }, [user]);

  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      // Role-based filtering
      if (user?.roleCode === 4) { // גורם דורש
        // Show only tasks where division or department matches user's division/department
        // For demo purposes, we'll show tasks where requester matches user
        if (program.requesterName !== user.fullName) {
          return false;
        }
      } else if (user?.roleCode === 3) { // קניין
        // Show only tasks assigned to this officer with specific statuses
        if (program.assignedOfficerName !== user.fullName) {
          return false;
        }
        // Status filtering is handled by default status filter
      } else if (user?.roleCode === 2) { // ראש צוות
        // Show only tasks where team matches user's team with specific statuses
        if (program.teamName !== user.procurementTeam) {
          return false;
        }
        // Status filtering is handled by default status filter
      }
      // For מנהל רכש (roleCode 1), show all tasks

      // Apply filter selections
      if (filters.status.length > 0 && !filters.status.includes(program.status)) return false;
      if (filters.assignedOfficer.length > 0 && !filters.assignedOfficer.includes(program.assignedOfficerName || '')) return false;
      if (filters.domain.length > 0 && !filters.domain.includes(program.domainName || '')) return false;
      if (filters.complexity.length > 0 && !filters.complexity.includes(program.complexity?.toString() || '')) return false;
      if (filters.requester.length > 0 && !filters.requester.includes(program.requesterName || '')) return false;
      if (filters.team.length > 0 && !filters.team.includes(program.teamName || '')) return false;
      
      // Quarter filter
      if (filters.quarter.length > 0) {
        const programQuarter = program.requiredQuarter ? 
          `Q${Math.ceil((program.requiredQuarter.getMonth() + 1) / 3)}/${program.requiredQuarter.getFullYear().toString().slice(-2)}` : 
          '';
        if (!filters.quarter.includes(programQuarter)) return false;
      }

      return true;
    });
  }, [programs, filters, user]);

  const handleProgramClick = (program: Program) => {
    console.log('Navigating to station-assignment for task:', program.taskId);
    navigate(`/station-assignment/${program.taskId}`);
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <DashboardFilters 
        filters={filters}
        onFiltersChange={setFilters}
        programs={programs}
        userRole={user?.roleCode}
      />

      {/* Programs Grid - 3 columns for wider cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
          <p className="text-gray-500 text-lg">
            {programs.length === 0 ? 'אין משימות במערכת' : 'לא נמצאו משימות המתאימות לסינון'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;