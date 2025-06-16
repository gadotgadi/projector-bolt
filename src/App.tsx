import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import LoginForm from './components/auth/LoginForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Index from './pages/Index';
import NewTask from './pages/NewTask';
import StationAssignment from './pages/StationAssignment';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/toaster"
import EngagementTypes from './pages/EngagementTypes';
import ProcurementStaff from './pages/ProcurementStaff';
import SystemSettings from './pages/SystemSettings';
import ActivityPoolManagement from './pages/system/ActivityPoolManagement';
import DomainsManagement from './pages/system/DomainsManagement';
import WorkersManagement from './pages/system/WorkersManagement';
import DivisionsManagement from './pages/system/DivisionsManagement';
import DepartmentsManagement from './pages/system/DepartmentsManagement';
import ProcurementTeamsManagement from './pages/system/ProcurementTeamsManagement';
import InfrastructureMaintenance from './pages/InfrastructureMaintenance';
import OrganizationalRoles from './pages/infrastructure/OrganizationalRoles';
import StatusValues from './pages/infrastructure/StatusValues';
import StructureValues from './pages/infrastructure/StructureValues';
import Permissions from './pages/infrastructure/Permissions';
import ProgressTracking from './pages/ProgressTracking';
import PlanningConvergence from './pages/PlanningConvergence';
import ProcurementLoad from './pages/ProcurementLoad';
import PlanningHelpers from './pages/PlanningHelpers';
import PlaceholderPage from './pages/PlaceholderPage';
import { getDefaultRouteForRole } from './utils/rolePermissions';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to={getDefaultRouteForRole(user!.roleCode)} replace />} />
      
      <Route path="/" element={
        <ProtectedRoute route="/">
          <Index />
        </ProtectedRoute>
      } />
      
      <Route path="/new-task" element={
        <ProtectedRoute route="/new-task">
          <NewTask />
        </ProtectedRoute>
      } />
      
      <Route path="/station-assignment/:taskId" element={
        <ProtectedRoute route="/station-assignment">
          <StationAssignment />
        </ProtectedRoute>
      } />
      
      <Route path="/progress-tracking" element={
        <ProtectedRoute route="/progress-tracking">
          <ProgressTracking />
        </ProtectedRoute>
      } />
      
      <Route path="/planning-convergence" element={
        <ProtectedRoute route="/planning-convergence">
          <PlanningConvergence />
        </ProtectedRoute>
      } />
      
      <Route path="/procurement-load" element={
        <ProtectedRoute route="/procurement-load">
          <ProcurementLoad />
        </ProtectedRoute>
      } />
      
      {/* Placeholder routes for future screens */}
      <Route path="/work-plan" element={
        <ProtectedRoute route="/work-plan">
          <PlaceholderPage title="תוכנית עבודה" description="מסך זה יכלול תצוגה של תוכנית העבודה השנתית ומעקב אחר יעדים." />
        </ProtectedRoute>
      } />
      
      <Route path="/overall-tracking" element={
        <ProtectedRoute route="/overall-tracking">
          <PlaceholderPage title="מעקב כולל" description="מסך זה יכלול תצוגה כוללת של כל המשימות והפרויקטים בארגון." />
        </ProtectedRoute>
      } />
      
      <Route path="/detailed-tracking" element={
        <ProtectedRoute route="/detailed-tracking">
          <PlaceholderPage title="מעקב מפורט" description="מסך זה יכלול מעקב מפורט אחר משימות ספציפיות עם אפשרויות דיווח מתקדמות." />
        </ProtectedRoute>
      } />
      
      <Route path="/procurement-staff" element={
        <ProtectedRoute route="/procurement-staff">
          <ProcurementStaff />
        </ProtectedRoute>
      } />
      
      <Route path="/engagement-types" element={
        <ProtectedRoute route="/engagement-types">
          <EngagementTypes />
        </ProtectedRoute>
      } />
      
      <Route path="/planning-helpers" element={
        <ProtectedRoute route="/planning-helpers">
          <PlanningHelpers />
        </ProtectedRoute>
      } />
      
      <Route path="/system-settings" element={
        <ProtectedRoute route="/system-settings">
          <SystemSettings />
        </ProtectedRoute>
      } />
      
      <Route path="/system-settings/activity-pool" element={
        <ProtectedRoute route="/system-settings/activity-pool">
          <ActivityPoolManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/system-settings/domains" element={
        <ProtectedRoute route="/system-settings/domains">
          <DomainsManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/system-settings/workers" element={
        <ProtectedRoute route="/system-settings/workers">
          <WorkersManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/system-settings/divisions" element={
        <ProtectedRoute route="/system-settings/divisions">
          <DivisionsManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/system-settings/departments" element={
        <ProtectedRoute route="/system-settings/departments">
          <DepartmentsManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/system-settings/procurement-teams" element={
        <ProtectedRoute route="/system-settings/procurement-teams">
          <ProcurementTeamsManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/infrastructure-maintenance" element={
        <ProtectedRoute route="/infrastructure-maintenance">
          <InfrastructureMaintenance />
        </ProtectedRoute>
      } />
      
      <Route path="/infrastructure-maintenance/organizational-roles" element={
        <ProtectedRoute route="/infrastructure-maintenance/organizational-roles">
          <OrganizationalRoles />
        </ProtectedRoute>
      } />
      
      <Route path="/infrastructure-maintenance/status-values" element={
        <ProtectedRoute route="/infrastructure-maintenance/status-values">
          <StatusValues />
        </ProtectedRoute>
      } />
      
      <Route path="/infrastructure-maintenance/structure-values" element={
        <ProtectedRoute route="/infrastructure-maintenance/structure-values">
          <StructureValues />
        </ProtectedRoute>
      } />
      
      <Route path="/infrastructure-maintenance/permissions" element={
        <ProtectedRoute route="/infrastructure-maintenance/permissions">
          <Permissions />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;