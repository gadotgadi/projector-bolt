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
    console.log('🎯🎯🎯 Dashboard: נלחץ על משימה:', program.taskId);
    console.log('🎯🎯🎯 Dashboard: מנווט לנתיב:', `/station-assignment/${program.taskId}`);
    
    try {
      // Force navigation with replace to ensure it works
      window.location.href = `/station-assignment/${program.taskId}`;
    } catch (error) {
      console.error('❌ Dashboard: שגיאה בניווט:', error);
      // Fallback to regular navigation
      navigate(`/station-assignment/${program.taskId}`);
    }
  };

  // Test function for direct navigation
  const testDirectNavigation = () => {
    console.log('🧪 TESTING DIRECT NAVIGATION');
    alert('🧪 Direct navigation test - going to task 1001');
    try {
      window.location.href = '/station-assignment/1001';
    } catch (error) {
      console.error('🧪 Direct navigation failed:', error);
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
    <div className="space-y-6" style={{ position: 'relative', zIndex: 1 }}>
      {/* Filters */}
      <DashboardFilters 
        filters={filters}
        onFiltersChange={setFilters}
        programs={programs}
      />

      {/* MEGA TEST SECTION - FIXED WITH PROPER Z-INDEX AND POSITIONING */}
      <div 
        className="bg-purple-500 text-white p-6 rounded-lg border-4 border-yellow-400"
        style={{ 
          position: 'relative', 
          zIndex: 1000,
          pointerEvents: 'auto'
        }}
      >
        <h2 className="text-2xl font-bold mb-4">🧪 NAVIGATION TEST ZONE 🧪</h2>
        
        {/* Test Button 1 - Simple Alert */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🧪 TEST 1: Simple alert');
            alert('🧪 TEST 1: Simple click works!');
          }}
          onMouseDown={(e) => {
            console.log('🧪 TEST 1: Mouse down');
          }}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded mr-4 mb-4"
          style={{ 
            position: 'relative', 
            zIndex: 1001,
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        >
          TEST 1: Simple Alert
        </button>

        {/* Test Button 2 - Console Log */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🧪 TEST 2: Console log test');
            console.log('🧪 Current location:', window.location.href);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded mr-4 mb-4"
          style={{ 
            position: 'relative', 
            zIndex: 1001,
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        >
          TEST 2: Console Log
        </button>

        {/* Test Button 3 - Direct Navigation */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            testDirectNavigation();
          }}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded mr-4 mb-4"
          style={{ 
            position: 'relative', 
            zIndex: 1001,
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        >
          TEST 3: Direct Navigation
        </button>

        {/* Test Button 4 - React Router Navigate */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🧪 TEST 4: React Router navigate');
            alert('🧪 TEST 4: Using React Router');
            navigate('/station-assignment/1001');
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded mr-4 mb-4"
          style={{ 
            position: 'relative', 
            zIndex: 1001,
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        >
          TEST 4: React Router
        </button>
      </div>

      {/* DIRECT TASK CARD TEST - FIXED */}
      <div 
        className="bg-yellow-300 p-4 rounded-lg border-4 border-red-500"
        style={{ 
          position: 'relative', 
          zIndex: 999,
          pointerEvents: 'auto'
        }}
      >
        <h3 className="text-xl font-bold mb-4 text-black">🎯 DIRECT TASK CARD TEST</h3>
        <div 
          style={{
            width: '300px',
            height: '150px',
            backgroundColor: '#ff6b6b',
            border: '3px solid #000',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'white',
            position: 'relative',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯🎯🎯 DIRECT TEST CARD CLICKED!');
            alert('🎯 DIRECT TEST CARD WORKS!');
            window.location.href = '/test-station/9999';
          }}
          onMouseDown={() => console.log('🎯 DIRECT TEST: Mouse Down')}
          onMouseEnter={() => console.log('🎯 DIRECT TEST: Mouse Enter')}
          onMouseLeave={() => console.log('🎯 DIRECT TEST: Mouse Leave')}
        >
          🎯 CLICK THIS DIRECT TEST CARD 🎯
        </div>
      </div>

      {/* Programs Grid - 3 columns for wider cards */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        style={{ 
          position: 'relative', 
          zIndex: 1,
          pointerEvents: 'auto'
        }}
      >
        {filteredPrograms.map(program => {
          console.log('🔥 Dashboard: יוצר TaskCard עבור משימה:', program.taskId);
          return (
            <div
              key={program.taskId}
              style={{ 
                position: 'relative', 
                zIndex: 2,
                pointerEvents: 'auto'
              }}
            >
              <TaskCard 
                task={program}
                onClick={() => {
                  console.log('🎯🎯🎯 Dashboard: onClick callback נקרא עבור משימה:', program.taskId);
                  handleProgramClick(program);
                }}
              />
            </div>
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