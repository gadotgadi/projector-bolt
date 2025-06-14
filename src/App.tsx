
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/new-task" element={<NewTask />} />
        <Route path="/station-assignment/:taskId" element={<StationAssignment />} />
        <Route path="/engagement-types" element={<EngagementTypes />} />
        <Route path="/procurement-staff" element={<ProcurementStaff />} />
        <Route path="/progress-tracking" element={<ProgressTracking />} />
        <Route path="/planning-convergence" element={<PlanningConvergence />} />
        <Route path="/procurement-load" element={<ProcurementLoad />} />
        <Route path="/system-settings" element={<SystemSettings />} />
        <Route path="/system-settings/activity-pool" element={<ActivityPoolManagement />} />
        <Route path="/system-settings/domains" element={<DomainsManagement />} />
        <Route path="/system-settings/workers" element={<WorkersManagement />} />
        <Route path="/system-settings/divisions" element={<DivisionsManagement />} />
        <Route path="/system-settings/departments" element={<DepartmentsManagement />} />
        <Route path="/system-settings/procurement-teams" element={<ProcurementTeamsManagement />} />
        <Route path="/infrastructure-maintenance" element={<InfrastructureMaintenance />} />
        <Route path="/infrastructure-maintenance/organizational-roles" element={<OrganizationalRoles />} />
        <Route path="/infrastructure-maintenance/status-values" element={<StatusValues />} />
        <Route path="/infrastructure-maintenance/structure-values" element={<StructureValues />} />
        <Route path="/infrastructure-maintenance/permissions" element={<Permissions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
