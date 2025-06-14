import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: (user: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Mock users data - in production this would come from the server
  const mockUsers = [
    { id: 1, employeeId: '1001', password: '123456', fullName: 'אבי כהן', roleCode: 1, roleDescription: 'מנהל רכש' },
    { id: 2, employeeId: '1002', password: '123456', fullName: 'שרה לוי', roleCode: 2, roleDescription: 'ראש צוות' },
    { id: 3, employeeId: '1003', password: '123456', fullName: 'דוד ישראל', roleCode: 3, roleDescription: 'קניין' },
    { id: 4, employeeId: '1004', password: '123456', fullName: 'רחל כהן', roleCode: 4, roleDescription: 'גורם דורש' },
    { id: 5, employeeId: '0000', password: '123456', fullName: 'מנהלן מערכת', roleCode: 0, roleDescription: 'מנהלן מערכת' },
    { id: 6, employeeId: '9999', password: '123456', fullName: 'גורם טכני', roleCode: 9, roleDescription: 'גורם טכני' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate input
    if (!employeeId || employeeId.length !== 4) {
      setError('קוד משתמש חייב להיות בן 4 ספרות');
      setIsLoading(false);
      return;
    }

    if (!password || password.length !== 6) {
      setError('סיסמה חייבת להיות בת 6 תווים');
      setIsLoading(false);
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      const user = mockUsers.find(u => u.employeeId === employeeId && u.password === password);
      
      if (user) {
        toast({
          title: "התחברות הצליחה",
          description: `ברוך הבא ${user.fullName}`,
        });
        onLogin(user);
      } else {
        setError('קוד משתמש או סיסמה שגויים');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/image.png" 
              alt="PROJECTOR Logo" 
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            כניסה למערכת
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-right">
                קוד משתמש (4 ספרות)
              </Label>
              <Input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="text-right text-lg"
                placeholder="0000"
                maxLength={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-right">
                סיסמה (6 תווים)
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value.slice(0, 6))}
                className="text-right text-lg"
                placeholder="••••••"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-right">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full text-lg py-3"
              disabled={isLoading}
            >
              {isLoading ? 'מתחבר...' : 'כניסה למערכת'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <div className="border-t pt-4">
              <p className="font-medium mb-2">משתמשים לדוגמה:</p>
              <div className="space-y-1 text-xs">
                <p>מנהל רכש: 1001 / 123456</p>
                <p>ראש צוות: 1002 / 123456</p>
                <p>קניין: 1003 / 123456</p>
                <p>גורם דורש: 1004 / 123456</p>
                <p>מנהלן מערכת: 0000 / 123456</p>
                <p>גורם טכני: 9999 / 123456</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;