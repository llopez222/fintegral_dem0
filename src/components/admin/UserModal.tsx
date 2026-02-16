import { useState, useEffect } from 'react';
import { User, Mail, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ExtendedUser, UserRole } from '@/mocks/users';
import { getDefaultPermissions, getRoleDisplayName } from '@/mocks/users';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<ExtendedUser> & { password?: string }) => void;
  user?: ExtendedUser | null;
  mode: 'add' | 'edit';
  availableRoles: UserRole[];
}

const AVAILABLE_DEPARTMENTS = [
  { value: 'dept_1', label: 'Department 1' },
  { value: 'dept_2', label: 'Department 2' },
  { value: 'dept_3', label: 'Department 3' },
  { value: 'sales', label: 'Sales' },
  { value: 'operations', label: 'Operations' },
  { value: 'underwriting', label: 'Underwriting' },
  { value: 'all', label: 'All Departments' },
];

export function UserModal({ isOpen, onClose, onSave, user, mode, availableRoles }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: 'loan_officer' as UserRole,
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        password: '',
        confirmPassword: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: 'dept_1',
        role: 'loan_officer',
        password: '',
        confirmPassword: '',
      });
    }
    setError(null);
  }, [user, mode, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name || !formData.email || !formData.department) {
      setError('Please fill in all required fields');
      return false;
    }
    if (mode === 'add') {
      if (!formData.password) {
        setError('Password is required for new users');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    if (mode === 'edit' && formData.password) {
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const userData: Partial<ExtendedUser> & { password?: string } = {
      name: formData.name,
      email: formData.email,
      department: formData.department,
      role: formData.role,
      permissions: getDefaultPermissions(formData.role),
    };

    if (formData.password) {
      userData.password = formData.password;
    }

    onSave(userData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New User' : 'Edit User'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="pl-9"
                placeholder="John Smith"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="pl-9"
                placeholder="john@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleChange('department', value)}
                >
                  <SelectTrigger className="pl-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleChange('role', value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {getRoleDisplayName(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-slate-700 mb-3">
              {mode === 'add' ? 'Set Password *' : 'Change Password (optional)'}
            </p>
            
            <div className="space-y-3">
              <Input
                type="password"
                placeholder={mode === 'add' ? 'Enter password' : 'Leave blank to keep current'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
              {(mode === 'add' || formData.password) && (
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-800 hover:bg-blue-900">
              {mode === 'add' ? 'Create User' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
