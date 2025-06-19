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
  availableFilters: string[];
  userRole?: number;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  programs,
  availableFilters,
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
    if (!program.requiredQuarter) return '';
    const quarter = Math.ceil((program.requiredQuarter.getMonth() + 1) / 3);
    const year = program.requiredQuarter.getFullYear().toString().slice(-2);
    return `Q${quarter}/${year}`;
  }).filter(Boolean)));

  // Get available statuses based on role
  const getAvailableStatuses = () => {
    if (userRole === 3 || userRole === 2) { // קניין או ראש צוות
      return ['Plan', 'In Progress', 'Complete'];
    }
    return Object.keys(STATUS_CONFIG);
  };

  const renderFilter = (filterKey: string, label: string, options: string[], isStatus = false) => {
    if (!availableFilters.includes(filterKey)) return null;

    return (
      <div key={filterKey}>
        <Collapsible open={openSections[filterKey]} onOpenChange={(isOpen) => setOpenSections(prev => ({ ...prev, [filterKey]: isOpen }))}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between text-right"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections[filterKey] ? 'rotate-180' : ''}`} />
              <span>{getDisplayText(filterKey as keyof FilterState, label)}</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="border rounded-md p-2 space-y-2 bg-white max-h-32 overflow-y-auto">
              {isStatus ? (
                getAvailableStatuses().map((status) => (
                  <div key={status} className="flex items-center space-x-2 justify-end">
                    <label className="text-sm text-gray-700 cursor-pointer">
                      {STATUS_CONFIG[status as TaskStatus]?.label || status}
                    </label>
                    <Checkbox
                      checked={filters[filterKey as keyof FilterState].includes(status)}
                      onCheckedChange={(checked) => handleFilterChange(filterKey as keyof FilterState, status, checked as boolean)}
                    />
                  </div>
                ))
              ) : filterKey === 'complexity' ? (
                ['1', '2', '3'].map((complexity) => (
                  <div key={complexity} className="flex items-center space-x-2 justify-end">
                    <label className="text-sm text-gray-700 cursor-pointer">
                      {complexity === '1' ? 'פשוט' : complexity === '2' ? 'בינוני' : 'מורכב'}
                    </label>
                    <Checkbox
                      checked={filters.complexity.includes(complexity)}
                      onCheckedChange={(checked) => handleFilterChange('complexity', complexity, checked as boolean)}
                    />
                  </div>
                ))
              ) : (
                options.map(option => (
                  <div key={option} className="flex items-center space-x-2 justify-end">
                    <label className="text-sm text-gray-700 cursor-pointer">{option}</label>
                    <Checkbox
                      checked={filters[filterKey as keyof FilterState].includes(option)}
                      onCheckedChange={(checked) => handleFilterChange(filterKey as keyof FilterState, option, checked as boolean)}
                    />
                  </div>
                ))
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  const filterConfigs = [
    { key: 'status', label: 'בחר סטטוס', options: [], isStatus: true },
    { key: 'assignedOfficer', label: 'בחר קניין מטפל', options: uniqueOfficers },
    { key: 'requester', label: 'בחר גורם דורש', options: uniqueRequesters },
    { key: 'team', label: 'בחר צוות', options: uniqueTeams },
    { key: 'quarter', label: 'בחר רבעון', options: uniqueQuarters },
    { key: 'domain', label: 'בחר תחום רכש', options: uniqueDomains },
    { key: 'complexity', label: 'בחר רמת מורכבות', options: [] }
  ];

  const visibleFilters = filterConfigs.filter(config => availableFilters.includes(config.key));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className={`grid grid-cols-1 gap-6 ${
        visibleFilters.length === 1 ? 'lg:grid-cols-1' :
        visibleFilters.length === 2 ? 'lg:grid-cols-2' :
        visibleFilters.length === 3 ? 'lg:grid-cols-3' :
        'lg:grid-cols-4'
      }`}>
        {visibleFilters.map(config => 
          renderFilter(config.key, config.label, config.options, config.isStatus)
        )}
      </div>
    </div>
  );
};

export default DashboardFilters;