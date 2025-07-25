import React, { useState, useEffect } from 'react';
import { Program, TaskStatus, PLANNING_SOURCE_CONFIG, CURRENCY_CONFIG } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface NewTaskFormProps {
  onSave: (task: any) => void;
  onCancel: () => void;
}

// Mock data for form dropdowns
const mockDivisions = [
  { id: 1, name: 'לוגיסטיקה' },
  { id: 2, name: 'טכנולוגיה' },
  { id: 3, name: 'מחקר ופיתוח' },
  { id: 4, name: 'משאבי אנוש' },
  { id: 5, name: 'מכירות' },
  { id: 6, name: 'תפעול' }
];

const mockDepartments = [
  { id: 1, name: 'רכש וחוזים', divisionId: 1 },
  { id: 2, name: 'תפעול ותחזוקה', divisionId: 1 },
  { id: 3, name: 'מערכות מידע', divisionId: 2 },
  { id: 4, name: 'פיתוח תוכנה', divisionId: 2 },
  { id: 5, name: 'מחקר', divisionId: 3 },
  { id: 6, name: 'פיתוח', divisionId: 3 },
  { id: 7, name: 'גיוס', divisionId: 4 },
  { id: 8, name: 'שכר', divisionId: 4 }
];

const mockDomains = [
  { id: 1, description: 'רכש לוגיסטי' },
  { id: 2, description: 'רכש טכנולוגי' },
  { id: 3, description: 'שירותים מקצועיים' },
  { id: 4, description: 'תחזוקה ותפעול' },
  { id: 5, description: 'ציוד משרדי' },
  { id: 6, description: 'תוכנה ומערכות' }
];

const mockRequesters = [
  { id: 5, fullName: 'רחל אברהם', divisionId: 4, departmentId: 7 },
  { id: 6, fullName: 'יוסי לוי', divisionId: 3, departmentId: 5 },
  { id: 7, fullName: 'מירי דוד', divisionId: 2, departmentId: 3 },
  { id: 8, fullName: 'דני רוזן', divisionId: 1, departmentId: 1 }
];

const NewTaskForm: React.FC<NewTaskFormProps> = ({ onSave, onCancel }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [isFormLocked, setIsFormLocked] = useState(false);
  
  // Current year from header
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState({
    workYear: currentYear,
    requiredQuarter: generateCurrentQuarter(),
    title: '',
    description: '',
    requesterName: user?.roleCode === 4 ? user.fullName : '',
    requesterId: user?.roleCode === 4 ? user.id : undefined,
    divisionName: '',
    divisionId: undefined as number | undefined,
    departmentName: '',
    departmentId: undefined as number | undefined,
    domainName: '',
    domainId: undefined as number | undefined,
    estimatedAmount: undefined as number | undefined,
    currency: undefined as string | undefined,
    supplierList: '',
    justification: '',
    planningSource: 'annual_planning' as const,
    complexity: undefined as number | undefined
  });

  // Auto-fill division and department when requester changes
  useEffect(() => {
    if (formData.requesterId) {
      const requester = mockRequesters.find(r => r.id === formData.requesterId);
      if (requester) {
        // Auto-fill division
        if (requester.divisionId) {
          const division = mockDivisions.find(d => d.id === requester.divisionId);
          if (division) {
            setFormData(prev => ({
              ...prev,
              divisionId: division.id,
              divisionName: division.name
            }));
          }
        }
        
        // Auto-fill department
        if (requester.departmentId) {
          const department = mockDepartments.find(d => d.id === requester.departmentId);
          if (department) {
            setFormData(prev => ({
              ...prev,
              departmentId: department.id,
              departmentName: department.name
            }));
          }
        }
      }
    }
  }, [formData.requesterId]);

  function generateCurrentQuarter(): string {
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    const year = now.getFullYear().toString().slice(-2);
    return `Q${quarter}/${year}`;
  }

  function generateQuarterOptions(): string[] {
    const options = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year <= currentYear + 2; year++) {
      for (let q = 1; q <= 4; q++) {
        const shortYear = year.toString().slice(-2);
        options.push(`Q${q}/${shortYear}`);
      }
    }
    return options;
  }

  const handleChange = (field: string, value: any) => {
    if (isFormLocked) return;
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuarterChange = (value: string) => {
    if (isFormLocked) return;
    
    setFormData(prev => ({ ...prev, requiredQuarter: value }));
  };

  const handleRequesterChange = (requesterId: string) => {
    if (isFormLocked) return;
    
    const requester = mockRequesters.find(r => r.id.toString() === requesterId);
    if (requester) {
      setFormData(prev => ({
        ...prev,
        requesterId: requester.id,
        requesterName: requester.fullName
      }));
    }
  };

  const handleDivisionChange = (divisionId: string) => {
    if (isFormLocked) return;
    
    const division = mockDivisions.find(d => d.id.toString() === divisionId);
    if (division) {
      setFormData(prev => ({
        ...prev,
        divisionId: division.id,
        divisionName: division.name,
        // Reset department when division changes
        departmentId: undefined,
        departmentName: ''
      }));
    }
  };

  const handleDepartmentChange = (departmentId: string) => {
    if (isFormLocked) return;
    
    const department = mockDepartments.find(d => d.id.toString() === departmentId);
    if (department) {
      setFormData(prev => ({
        ...prev,
        departmentId: department.id,
        departmentName: department.name
      }));
    }
  };

  const handleDomainChange = (domainId: string) => {
    if (isFormLocked) return;
    
    const domain = mockDomains.find(d => d.id.toString() === domainId);
    if (domain) {
      setFormData(prev => ({
        ...prev,
        domainId: domain.id,
        domainName: domain.description
      }));
    }
  };

  const validateForm = (): boolean => {
    // Required fields validation
    if (!formData.title.trim()) {
      toast({
        title: "שגיאה",
        description: "כותרת המשימה היא שדה חובה",
        variant: "destructive"
      });
      return false;
    }

    if (formData.title.length > 25) {
      toast({
        title: "שגיאה",
        description: "כותרת המשימה לא יכולה להיות יותר מ-25 תווים",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.requesterName.trim()) {
      toast({
        title: "שגיאה",
        description: "גורם דורש הוא שדה חובה",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.divisionName.trim()) {
      toast({
        title: "שגיאה",
        description: "אגף לקוח הוא שדה חובה",
        variant: "destructive"
      });
      return false;
    }

    // Currency validation
    if (formData.estimatedAmount && !formData.currency) {
      toast({
        title: "שגיאה",
        description: "אם הוזן אומדן התקשרות, חובה לבחור מטבע",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate new task ID (mock)
      const newTaskId = 2000 + Math.floor(Math.random() * 1000);

      // Convert quarter format to date
      const [quarter, year] = formData.requiredQuarter.split('/');
      const quarterNum = parseInt(quarter.replace('Q', ''));
      const fullYear = 2000 + parseInt(year);
      const month = (quarterNum - 1) * 3;
      const requiredQuarterDate = new Date(fullYear, month, 1);

      const taskData = {
        taskId: newTaskId,
        workYear: formData.workYear,
        requiredQuarter: requiredQuarterDate,
        title: formData.title,
        description: formData.description,
        requesterName: formData.requesterName,
        divisionName: formData.divisionName,
        departmentName: formData.departmentName,
        domainName: formData.domainName,
        estimatedAmount: formData.estimatedAmount,
        currency: formData.currency,
        supplierList: formData.supplierList,
        justification: formData.justification,
        planningSource: formData.planningSource,
        complexity: formData.complexity,
        status: 'Open',
        lastUpdate: new Date(),
        createdAt: new Date()
      };

      console.log('Mock task created:', taskData);
      
      setTaskId(newTaskId);
      setIsFormLocked(true);
      
      toast({
        title: "הצלחה",
        description: `דרישה ${newTaskId} נוספה בהצלחה`,
      });

      // Call the onSave callback with the saved task
      onSave(taskData);

      // Navigate back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בשמירת המשימה",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user can create new tasks (mock - always allow for demo)
  const canCreateTask = () => {
    return true; // Always allow in mock mode
  };

  // Get available divisions for manual selection
  const getAvailableDivisions = () => {
    if (user?.roleCode === 4) {
      // For requesters, check if they have a pre-assigned division
      const requester = mockRequesters.find(r => r.id === user.id);
      if (requester?.divisionId) {
        return []; // Division is locked, no manual selection
      }
    }
    return mockDivisions;
  };

  // Get available departments for manual selection
  const getAvailableDepartments = () => {
    if (user?.roleCode === 4) {
      // For requesters, check if they have a pre-assigned department
      const requester = mockRequesters.find(r => r.id === user.id);
      if (requester?.departmentId) {
        return []; // Department is locked, no manual selection
      }
    }
    
    // Filter departments by selected division
    return mockDepartments.filter(dept => 
      !formData.divisionId || dept.divisionId === formData.divisionId
    );
  };

  // Check if division field is locked
  const isDivisionLocked = () => {
    if (user?.roleCode === 4) {
      const requester = mockRequesters.find(r => r.id === user.id);
      return !!requester?.divisionId;
    }
    return false;
  };

  // Check if department field is locked
  const isDepartmentLocked = () => {
    if (user?.roleCode === 4) {
      const requester = mockRequesters.find(r => r.id === user.id);
      return !!requester?.departmentId;
    }
    return false;
  };

  // Check if planning source field is locked
  const isPlanningSourceLocked = () => {
    return user?.roleCode === 4; // Locked for requesters
  };

  // Check if user is procurement manager
  const isProcurementManager = () => {
    return user?.roleCode === 1;
  };

  if (!canCreateTask()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">אין הרשאה להעלות דרישות</h2>
          <p className="text-gray-600 mb-6">
            אין הרשאה להעלות דרישות במצב הנוכחי
          </p>
          <Button onClick={onCancel} variant="outline">
            חזרה לתפריט הראשי
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">מספר משימה</Label>
              <div className="text-lg font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded border min-w-[120px] text-center">
                {taskId || ''}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              className="px-6"
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            {!isFormLocked && (
              <Button 
                type="submit" 
                form="task-form" 
                className="bg-green-600 hover:bg-green-700 px-6 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'שומר...' : 'שמור'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <form id="task-form" onSubmit={handleSubmit} className="p-6 max-w-6xl mx-auto">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
          {/* First Row - Title and Description */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                כותרת המשימה <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="text-right text-sm"
                maxLength={25}
                required
                disabled={isSubmitting || isFormLocked}
                placeholder="עד 25 תווים"
              />
            </div>

            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                פירוט המשימה
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="text-right text-sm"
                maxLength={50}
                disabled={isSubmitting || isFormLocked}
                placeholder="עד 50 תווים"
                rows={3}
              />
            </div>
          </div>

          {/* Second Row - Left and Right Columns */}
          <div className="grid grid-cols-2 gap-12">
            {/* Right Column - Requester, Division, Department */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="requesterName" className="block text-sm font-medium text-gray-700 mb-2">
                  גורם דורש <span className="text-red-500">*</span>
                </Label>
                {user?.roleCode === 4 ? (
                  <Input
                    id="requesterName"
                    value={formData.requesterName}
                    className="text-right text-sm bg-gray-50"
                    disabled
                  />
                ) : (
                  <Select
                    value={formData.requesterId?.toString() || ''}
                    onValueChange={handleRequesterChange}
                    disabled={isSubmitting || isFormLocked}
                  >
                    <SelectTrigger className="text-right text-sm">
                      <SelectValue placeholder="בחר גורם דורש" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRequesters.map(requester => (
                        <SelectItem key={requester.id} value={requester.id.toString()}>
                          {requester.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="divisionName" className="block text-sm font-medium text-gray-700 mb-2">
                  אגף <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="divisionName"
                  value={formData.divisionName}
                  className="text-right text-sm bg-gray-50"
                  disabled
                  placeholder="יוגדר אוטומטית לפי הגורם הדורש"
                />
              </div>

              <div>
                <Label htmlFor="departmentName" className="block text-sm font-medium text-gray-700 mb-2">
                  מחלקה
                </Label>
                {isDepartmentLocked() ? (
                  <Input
                    id="departmentName"
                    value={formData.departmentName}
                    className="text-right text-sm bg-gray-50"
                    disabled
                  />
                ) : (
                  <Select
                    value={formData.departmentId?.toString() || ''}
                    onValueChange={handleDepartmentChange}
                    disabled={isSubmitting || isFormLocked}
                  >
                    <SelectTrigger className="text-right text-sm">
                      <SelectValue placeholder="בחר מחלקה" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDepartments().map(department => (
                        <SelectItem key={department.id} value={department.id.toString()}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Left Column - Quarter, Planning Source, Amount */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="requiredQuarter" className="block text-sm font-medium text-gray-700 mb-2">
                  רבעון נדרש <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.requiredQuarter}
                  onValueChange={handleQuarterChange}
                  disabled={isSubmitting || isFormLocked}
                >
                  <SelectTrigger className="text-right text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {generateQuarterOptions().map(quarter => (
                      <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="planningSource" className="block text-sm font-medium text-gray-700 mb-2">
                  מקור תכנון <span className="text-red-500">*</span>
                </Label>
                {isPlanningSourceLocked() ? (
                  <Input
                    id="planningSource"
                    value={PLANNING_SOURCE_CONFIG[formData.planningSource]}
                    className="text-right text-sm bg-gray-50"
                    disabled
                  />
                ) : (
                  <Select
                    value={formData.planningSource}
                    onValueChange={(value) => handleChange('planningSource', value)}
                    disabled={isSubmitting || isFormLocked}
                  >
                    <SelectTrigger className="text-right text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PLANNING_SOURCE_CONFIG).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="estimatedAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  אומדן התקשרות
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="estimatedAmount"
                    type="number"
                    value={formData.estimatedAmount || ''}
                    onChange={(e) => handleChange('estimatedAmount', e.target.value ? Number(e.target.value) : undefined)}
                    className="text-right text-sm flex-1"
                    disabled={isSubmitting || isFormLocked}
                    placeholder="סכום"
                  />
                  <Select
                    value={formData.currency || ''}
                    onValueChange={(value) => handleChange('currency', value || undefined)}
                    disabled={isSubmitting || isFormLocked || !formData.estimatedAmount}
                  >
                    <SelectTrigger className="w-20 text-sm">
                      <SelectValue placeholder="מטבע" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CURRENCY_CONFIG).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Third Row - Suppliers and Justification */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <Label htmlFor="supplierList" className="block text-sm font-medium text-gray-700 mb-2">
                ספקים פוטנציאליים
              </Label>
              <Textarea
                id="supplierList"
                value={formData.supplierList}
                onChange={(e) => handleChange('supplierList', e.target.value)}
                className="text-right text-sm"
                rows={3}
                maxLength={50}
                disabled={isSubmitting || isFormLocked}
                placeholder="עד 50 תווים"
              />
            </div>

            <div>
              <Label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-2">
                הערות
              </Label>
              <Textarea
                id="justification"
                value={formData.justification}
                onChange={(e) => handleChange('justification', e.target.value)}
                className="text-right text-sm"
                rows={3}
                maxLength={50}
                disabled={isSubmitting || isFormLocked}
                placeholder="עד 50 תווים"
              />
            </div>
          </div>

          {/* Fourth Row - Domain and Complexity (only for procurement manager) */}
          {isProcurementManager() && (
            <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
              <div>
                <Label htmlFor="domainName" className="block text-sm font-medium text-gray-700 mb-2">
                  תחום רכש
                </Label>
                <Select
                  value={formData.domainId?.toString() || ''}
                  onValueChange={handleDomainChange}
                  disabled={isSubmitting || isFormLocked}
                >
                  <SelectTrigger className="text-right text-sm">
                    <SelectValue placeholder="בחר תחום רכש" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDomains.map(domain => (
                      <SelectItem key={domain.id} value={domain.id.toString()}>
                        {domain.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="complexity" className="block text-sm font-medium text-gray-700 mb-2">
                  רמת מורכבות
                </Label>
                <Select
                  value={formData.complexity?.toString() || ''}
                  onValueChange={(value) => handleChange('complexity', value ? Number(value) : undefined)}
                  disabled={isSubmitting || isFormLocked}
                >
                  <SelectTrigger className="text-right text-sm">
                    <SelectValue placeholder="בחר רמת מורכבות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">פשוט</SelectItem>
                    <SelectItem value="2">בינוני</SelectItem>
                    <SelectItem value="3">מורכב</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* System Messages Section */}
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <div className="text-sm text-gray-600">
            {isFormLocked ? (
              <div className="text-green-700 font-medium">
                ✓ דרישה {taskId} נוצרה בהצלחה. המסך נעול - ניתן לנווט למסך אחר באמצעות התפריט הראשי.
              </div>
            ) : (
              <div className="text-blue-700">
                מצב המערכת: פתוח לקליטת דרישות חדשות (מצב הדגמה)
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewTaskForm;