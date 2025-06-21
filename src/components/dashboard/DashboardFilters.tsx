import React, { useState } from 'react';
import { TaskStatus, STATUS_CONFIG, Program } from '../../types';
import { Checkbox } from '../ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';

interface FilterState {
  status: string[];
  assignedOfficer: string[];
  domain: string[];
  complexity: string[];
  requester: string[];
  team: string[];
  quarter: string[];
}

interface DashboardFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  programs: Program[];
  userRole?: number;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  programs,
  userRole
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    status: false,
    assignedOfficer: false,
    domain: false,
    complexity: false,
    requester: false,
    team: false,
    quarter: false
  });

  const handleFilterChange = (key: keyof FilterState, value: string, checked: boolean) => {
    const currentValues = filters[key] || [];
    let newValues: string[];
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    onFiltersChange({
      ...filters,
      [key]: newValues
    });
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getDisplayText = (filterKey: keyof FilterState, defaultText: string) => {
    const selectedValues = filters[filterKey];
    if (!selectedValues || selectedValues.length === 0) {
      return defaultText;
    }
    if (selectedValues.length === 1) {
      // For status, show the label instead of key
      if (filterKey === 'status') {
        return STATUS_CONFIG[selectedValues[0] as TaskStatus]?.label || selectedValues[0];
      }
      // For complexity, show Hebrew labels
      if (filterKey === 'complexity') {
        const complexityLabels: Record<string, string> = {
          '1': 'פשוט',
          '2': 'בינוני',
          '3': 'מורכב'
        };
        return complexityLabels[selectedValues[0]] || selectedValues[0];
      }
      return selectedValues[0];
    }
    return `נבחרו ${selectedValues.length} ערכים`;
  };

  // Extract unique values from programs
  const uniqueOfficers = Array.from(new Set(programs.map(program => program.assignedOfficerName).filter(Boolean)));
  const uniqueDomains = Array.from(new Set(programs.map(program => program.domainName).filter(Boolean)));
  const uniqueRequesters = Array.from(new Set(programs.map(program => program.requesterName).filter(Boolean)));
  const uniqueTeams = Array.from(new Set(programs.map(program => program.teamName).filter(Boolean)));
  
  // Generate quarters from programs
  const uniqueQuarters = Array.from(new Set(programs.map(program => {
    if (!program.requiredQuarter) return null;
    const quarter = Math.ceil((program.requiredQuarter.getMonth() + 1) / 3);
    const year = program.requiredQuarter.getFullYear().toString().slice(-2);
    return `Q${quarter}/${year}`;
  }).filter(Boolean))).sort();

  // Determine which filters to show based on user role
  const getVisibleFilters = () => {
    switch (userRole) {
      case 4: // גורם דורש
        return [
          { key: 'status', label: 'סטטוס:' },
          { key: 'requester', label: 'דורש:' },
          { key: 'quarter', label: 'רבעון:' }
        ];
      case 1: // מנהל רכש
        return [
          { key: 'status', label: 'סטטוס:' },
          { key: 'team', label: 'צוות:' },
          { key: 'requester', label: 'דורש:' },
          { key: 'quarter', label: 'רבעון:' }
        ];
      case 3: // קניין
        return [
          { key: 'status', label: 'סטטוס:' },
          { key: 'requester', label: 'דורש:' },
          { key: 'quarter', label: 'רבעון:' }
        ];
      case 2: // ראש צוות
        return [
          { key: 'status', label: 'סטטוס:' },
          { key: 'assignedOfficer', label: 'קניין:' },
          { key: 'quarter', label: 'רבעון:' }
        ];
      default:
        return [
          { key: 'status', label: 'סטטוס:' },
          { key: 'assignedOfficer', label: 'קניין מטפל:' },
          { key: 'domain', label: 'תחום רכש:' },
          { key: 'complexity', label: 'מורכבות:' }
        ];
    }
  };

  const visibleFilters = getVisibleFilters();

  const renderFilter = (filterConfig: { key: string; label: string }) => {
    const { key, label } = filterConfig;
    
    return (
      <div key={key} className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{label}</span>
        <Collapsible open={openSections[key]} onOpenChange={(isOpen) => setOpenSections(prev => ({ ...prev, [key]: isOpen }))}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="justify-between text-right min-w-[150px]"
              size="sm"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections[key] ? 'rotate-180' : ''}`} />
              <span className="truncate">{getDisplayText(key as keyof FilterState, 'הכל')}</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="absolute z-10 mt-1">
            <div className="border rounded-md p-2 space-y-2 bg-white max-h-32 overflow-y-auto shadow-lg min-w-[200px]">
              {key === 'status' && Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <div key={status} className="flex items-center space-x-2 justify-end">
                  <label className="text-sm text-gray-700 cursor-pointer">{config.label}</label>
                  <Checkbox
                    checked={filters.status.includes(status)}
                    onCheckedChange={(checked) => handleFilterChange('status', status, checked as boolean)}
                  />
                </div>
              ))}
              
              {key === 'team' && uniqueTeams.map(team => (
                <div key={team} className="flex items-center space-x-2 justify-end">
                  <label className="text-sm text-gray-700 cursor-pointer">{team}</label>
                  <Checkbox
                    checked={filters.team.includes(team)}
                    onCheckedChange={(checked) => handleFilterChange('team', team, checked as boolean)}
                  />
                </div>
              ))}
              
              {key === 'assignedOfficer' && uniqueOfficers.map(officer => (
                <div key={officer} className="flex items-center space-x-2 justify-end">
                  <label className="text-sm text-gray-700 cursor-pointer">{officer}</label>
                  <Checkbox
                    checked={filters.assignedOfficer.includes(officer)}
                    onCheckedChange={(checked) => handleFilterChange('assignedOfficer', officer, checked as boolean)}
                  />
                </div>
              ))}
              
              {key === 'requester' && uniqueRequesters.map(requester => (
                <div key={requester} className="flex items-center space-x-2 justify-end">
                  <label className="text-sm text-gray-700 cursor-pointer">{requester}</label>
                  <Checkbox
                    checked={filters.requester.includes(requester)}
                    onCheckedChange={(checked) => handleFilterChange('requester', requester, checked as boolean)}
                  />
                </div>
              ))}
              
              {key === 'quarter' && uniqueQuarters.map(quarter => (
                <div key={quarter} className="flex items-center space-x-2 justify-end">
                  <label className="text-sm text-gray-700 cursor-pointer">{quarter}</label>
                  <Checkbox
                    checked={filters.quarter.includes(quarter)}
                    onCheckedChange={(checked) => handleFilterChange('quarter', quarter, checked as boolean)}
                  />
                </div>
              ))}
              
              {key === 'domain' && uniqueDomains.map(domain => (
                <div key={domain} className="flex items-center space-x-2 justify-end">
                  <label className="text-sm text-gray-700 cursor-pointer">{domain}</label>
                  <Checkbox
                    checked={filters.domain.includes(domain)}
                    onCheckedChange={(checked) => handleFilterChange('domain', domain, checked as boolean)}
                  />
                </div>
              ))}
              
              {key === 'complexity' && (
                <>
                  <div className="flex items-center space-x-2 justify-end">
                    <label className="text-sm text-gray-700 cursor-pointer">פשוט</label>
                    <Checkbox
                      checked={filters.complexity.includes('1')}
                      onCheckedChange={(checked) => handleFilterChange('complexity', '1', checked as boolean)}
                    />
                  </div>
                  <div className="flex items-center space-x-2 justify-end">
                    <label className="text-sm text-gray-700 cursor-pointer">בינוני</label>
                    <Checkbox
                      checked={filters.complexity.includes('2')}
                      onCheckedChange={(checked) => handleFilterChange('complexity', '2', checked as boolean)}
                    />
                  </div>
                  <div className="flex items-center space-x-2 justify-end">
                    <label className="text-sm text-gray-700 cursor-pointer">מורכב</label>
                    <Checkbox
                      checked={filters.complexity.includes('3')}
                      onCheckedChange={(checked) => handleFilterChange('complexity', '3', checked as boolean)}
                    />
                  </div>
                </>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-6 justify-end">
        {visibleFilters.map(renderFilter)}
      </div>
    </div>
  );
};

export default DashboardFilters;