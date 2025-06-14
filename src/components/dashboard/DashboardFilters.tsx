
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
}

interface DashboardFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  programs: Program[];
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  programs
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    status: false,
    assignedOfficer: false,
    domain: false,
    complexity: false
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Status Filter */}
        <div>
          <Collapsible open={openSections.status} onOpenChange={(isOpen) => setOpenSections(prev => ({ ...prev, status: isOpen }))}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-right"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.status ? 'rotate-180' : ''}`} />
                <span>{getDisplayText('status', 'בחר סטטוס')}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="border rounded-md p-2 space-y-2 bg-white max-h-32 overflow-y-auto">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <div key={status} className="flex items-center space-x-2 justify-end">
                    <label className="text-sm text-gray-700 cursor-pointer">{config.label}</label>
                    <Checkbox
                      checked={filters.status.includes(status)}
                      onCheckedChange={(checked) => handleFilterChange('status', status, checked as boolean)}
                    />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Officer Filter */}
        <div>
          <Collapsible open={openSections.assignedOfficer} onOpenChange={(isOpen) => setOpenSections(prev => ({ ...prev, assignedOfficer: isOpen }))}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-right"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.assignedOfficer ? 'rotate-180' : ''}`} />
                <span>{getDisplayText('assignedOfficer', 'בחר קניין מטפל')}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="border rounded-md p-2 space-y-2 bg-white max-h-32 overflow-y-auto">
                {uniqueOfficers.map(officer => (
                  <div key={officer} className="flex items-center space-x-2 justify-end">
                    <label className="text-sm text-gray-700 cursor-pointer">{officer}</label>
                    <Checkbox
                      checked={filters.assignedOfficer.includes(officer)}
                      onCheckedChange={(checked) => handleFilterChange('assignedOfficer', officer, checked as boolean)}
                    />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Domain Filter */}
        <div>
          <Collapsible open={openSections.domain} onOpenChange={(isOpen) => setOpenSections(prev => ({ ...prev, domain: isOpen }))}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-right"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.domain ? 'rotate-180' : ''}`} />
                <span>{getDisplayText('domain', 'בחר תחום רכש')}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="border rounded-md p-2 space-y-2 bg-white max-h-32 overflow-y-auto">
                {uniqueDomains.map(domain => (
                  <div key={domain} className="flex items-center space-x-2 justify-end">
                    <label className="text-sm text-gray-700 cursor-pointer">{domain}</label>
                    <Checkbox
                      checked={filters.domain.includes(domain)}
                      onCheckedChange={(checked) => handleFilterChange('domain', domain, checked as boolean)}
                    />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Complexity Filter */}
        <div>
          <Collapsible open={openSections.complexity} onOpenChange={(isOpen) => setOpenSections(prev => ({ ...prev, complexity: isOpen }))}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-right"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.complexity ? 'rotate-180' : ''}`} />
                <span>{getDisplayText('complexity', 'בחר רמת מורכבות')}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="border rounded-md p-2 space-y-2 bg-white max-h-32 overflow-y-auto">
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
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
