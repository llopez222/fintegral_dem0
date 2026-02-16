import { useState, useEffect } from 'react';
import { Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ExtendedUser, Permissions } from '@/mocks/users';

interface PermissionsEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (permissions: Permissions) => void;
  user: ExtendedUser | null;
  readOnly?: boolean;
}

const permissionLabels: Record<keyof Permissions, { label: string; description: string; category: string }> = {
  viewOwnPipeline: {
    label: 'View Own Pipeline',
    description: 'Access to view personal loans and pipeline',
    category: 'Pipeline',
  },
  viewDepartmentPipeline: {
    label: 'View Department Pipeline',
    description: 'Access to view all loans in assigned department',
    category: 'Pipeline',
  },
  viewAllDepartments: {
    label: 'View All Departments',
    description: 'Access to view loans across all departments',
    category: 'Pipeline',
  },
  manageUsers: {
    label: 'Manage Users',
    description: 'Create, edit, and deactivate user accounts',
    category: 'Administration',
  },
  manageRoles: {
    label: 'Manage Roles',
    description: 'Assign and modify user roles',
    category: 'Administration',
  },
  editAnyLoan: {
    label: 'Edit Any Loan',
    description: 'Modify loans regardless of assignment',
    category: 'Loans',
  },
  viewAnalytics: {
    label: 'View Analytics',
    description: 'Access to analytics and reporting dashboard',
    category: 'Analytics',
  },
  systemSettings: {
    label: 'System Settings',
    description: 'Configure system-wide settings',
    category: 'Administration',
  },
  impersonateUsers: {
    label: 'Impersonate Users',
    description: 'Log in as other users for support',
    category: 'Administration',
  },
};

const categories = ['Pipeline', 'Loans', 'Analytics', 'Administration'];

export function PermissionsEditor({ isOpen, onClose, onSave, user, readOnly = false }: PermissionsEditorProps) {
  const [permissions, setPermissions] = useState<Permissions>({
    viewOwnPipeline: true,
    viewDepartmentPipeline: false,
    viewAllDepartments: false,
    manageUsers: false,
    manageRoles: false,
    editAnyLoan: false,
    viewAnalytics: false,
    systemSettings: false,
    impersonateUsers: false,
  });

  useEffect(() => {
    if (user) {
      setPermissions(user.permissions);
    }
  }, [user]);

  const handleToggle = (key: keyof Permissions) => {
    if (readOnly) return;
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onSave(permissions);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-700" />
            {readOnly ? 'Your Permissions' : `Edit Permissions: ${user.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {categories.map((category) => {
            const categoryPermissions = Object.entries(permissionLabels).filter(
              ([, config]) => config.category === category
            ) as [keyof Permissions, typeof permissionLabels[keyof Permissions]][];

            if (categoryPermissions.length === 0) return null;

            return (
              <div key={category}>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
                  {category}
                </h4>
                <div className="space-y-3">
                  {categoryPermissions.map(([key, config]) => (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        readOnly ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {config.label}
                          </span>
                          {permissions[key] && (
                            <Check className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {config.description}
                        </p>
                      </div>
                      <Switch
                        checked={permissions[key]}
                        onCheckedChange={() => handleToggle(key)}
                        disabled={readOnly}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          {!readOnly && (
            <Button onClick={handleSave} className="bg-blue-800 hover:bg-blue-900">
              Save Permissions
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
