import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users as UsersIcon, Shield, Building2, Power, Search, Filter, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUser } from '@/context/UserContext';
import { mockUsers, type ExtendedUser, type UserRole } from '@/mocks/users';
import { UserTable } from '@/components/admin/UserTable';
import { UserModal } from '@/components/admin/UserModal';
import { PermissionsEditor } from '@/components/admin/PermissionsEditor';

export function Users() {
  const navigate = useNavigate();
  const { currentUser, hasPermission, impersonate, isSuperAdmin } = useUser();
  
  // Local state for users (in real app, this would be from API)
  const [users, setUsers] = useState<ExtendedUser[]>(mockUsers);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [resetToken, setResetToken] = useState('');

  // Check permissions
  const canManageRoles = hasPermission('manageRoles');
  const canImpersonate = isSuperAdmin; // Only super_admin can impersonate - note: false when super_admin is impersonating another user

  // Get visible users based on current user's role
  const visibleUsers = useMemo(() => {
    if (!currentUser) return [];
    if (isSuperAdmin) return users; // Super admin sees all
    if (currentUser.role === 'manager') {
      // Manager sees users in their department
      return users.filter(u => u.department === currentUser.department);
    }
    return []; // Loan officers don't see user management
  }, [users, currentUser, isSuperAdmin]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return visibleUsers.filter(user => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Role filter
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      
      // Department filter (managers can only see their department anyway)
      if (deptFilter !== 'all' && user.department !== deptFilter) return false;
      
      // Status filter
      if (statusFilter !== 'all') {
        const isActive = user.permissions.viewOwnPipeline;
        if (statusFilter === 'active' && !isActive) return false;
        if (statusFilter === 'inactive' && isActive) return false;
      }
      
      return true;
    });
  }, [visibleUsers, searchQuery, roleFilter, deptFilter, statusFilter]);

  // Stats (based on visible users)
  const stats = useMemo(() => {
    const total = visibleUsers.length;
    const active = visibleUsers.filter(u => u.permissions.viewOwnPipeline).length;
    const byRole = visibleUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byDept = visibleUsers.reduce((acc, user) => {
      acc[user.department] = (acc[user.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, active, inactive: total - active, byRole, byDept };
  }, [visibleUsers]);

  // Handlers
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleAddUser = (userData: Partial<ExtendedUser> & { password?: string }) => {
    // Manager can only create loan_officer in their department
    const isManager = currentUser?.role === 'manager';
    const newUser: ExtendedUser = {
      id: `user_${Date.now()}`,
      name: userData.name || '',
      email: userData.email || '',
      role: isManager ? 'loan_officer' : (userData.role || 'loan_officer'),
      department: isManager ? (currentUser?.department || 'dept_1') : (userData.department || 'dept_1'),
      permissions: {
        viewOwnPipeline: true,
        viewDepartmentPipeline: false,
        viewAllDepartments: false,
        manageUsers: false,
        manageRoles: false,
        editAnyLoan: false,
        viewAnalytics: false,
        systemSettings: false,
        impersonateUsers: false,
      },
      avatar: undefined,
    };
    setUsers(prev => [...prev, newUser]);
    setIsAddModalOpen(false);
  };

  const handleEditUser = (userData: Partial<ExtendedUser> & { password?: string }) => {
    if (!selectedUser) return;
    
    // Manager can only edit users in their department
    if (currentUser?.role === 'manager' && selectedUser.department !== currentUser.department) {
      return;
    }
    
    setUsers(prev =>
      prev.map(u =>
        u.id === selectedUser.id
          ? { ...u, ...userData }
          : u
      )
    );
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleChangeRole = (newRole: UserRole) => {
    if (!selectedUser) return;
    
    // Manager cannot change roles
    if (currentUser?.role === 'manager') return;
    
    setUsers(prev =>
      prev.map(u =>
        u.id === selectedUser.id
          ? { ...u, role: newRole }
          : u
      )
    );
    setIsRoleModalOpen(false);
    setSelectedUser(null);
  };

  const handleEditPermissions = (permissions: ExtendedUser['permissions']) => {
    if (!selectedUser) return;
    
    setUsers(prev =>
      prev.map(u =>
        u.id === selectedUser.id
          ? { ...u, permissions }
          : u
      )
    );
    setIsPermissionsModalOpen(false);
    setSelectedUser(null);
  };

  const handleResetPassword = (user: ExtendedUser) => {
    const token = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setResetToken(token);
    setSelectedUser(user);
    setIsResetPasswordModalOpen(true);
  };

  const handleToggleActive = (user: ExtendedUser) => {
    // Manager can only toggle users in their department
    if (currentUser?.role === 'manager' && user.department !== currentUser.department) {
      return;
    }
    
    const isActive = user.permissions.viewOwnPipeline;
    
    setUsers(prev =>
      prev.map(u =>
        u.id === user.id
          ? {
              ...u,
              permissions: {
                ...u.permissions,
                viewOwnPipeline: !isActive,
              },
            }
          : u
      )
    );
  };

  const handleImpersonate = (user: ExtendedUser) => {
    // Only super_admin can impersonate
    if (!isSuperAdmin) return;
    impersonate(user.id);
    navigate('/pipeline');
  };

  // Get unique departments for filter (based on visible users)
  const departments = useMemo(() => {
    const depts = new Set(visibleUsers.map(u => u.department));
    return Array.from(depts);
  }, [visibleUsers]);

  // Available roles based on current user
  const availableRolesForAdd = useMemo((): UserRole[] => {
    if (isSuperAdmin) return ['loan_officer', 'manager'];
    if (currentUser?.role === 'manager') return ['loan_officer'];
    return ['loan_officer'];
  }, [isSuperAdmin, currentUser]);

  const availableRolesForEdit = useMemo((): UserRole[] => {
    if (isSuperAdmin) return ['loan_officer', 'manager', 'super_admin'];
    return ['loan_officer']; // Manager can only assign loan_officer
  }, [isSuperAdmin]);

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">User Management</h1>
          <p className="text-slate-500">
            {isSuperAdmin 
              ? 'Manage all team members and permissions' 
              : `Manage team members in ${currentUser.department}`}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-blue-700" />
            </div>
            <span className="text-sm text-slate-500">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Power className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-slate-500">Active</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{stats.active}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-700" />
            </div>
            <span className="text-sm text-slate-500">Roles</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{Object.keys(stats.byRole).length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-slate-500">Departments</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{Object.keys(stats.byDept).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Search - takes more space on desktop */}
        <div className="relative w-full lg:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        
        {/* Filters container */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-10 px-3 py-2 text-sm flex items-center justify-between gap-2 w-[140px]">
              <div className="flex items-center gap-2 overflow-hidden">
                <Filter className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{roleFilter === 'all' ? 'All Roles' : roleFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-50">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="loan_officer">Loan Officer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-10 px-3 py-2 text-sm flex items-center justify-between gap-2 w-[120px]">
              <div className="flex items-center gap-2 overflow-hidden">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">
                  {deptFilter === 'all' ? 'Dept: All' : deptFilter.replace('dept_', 'Dept ')}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-50">
              <SelectItem value="all">All</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept === 'all' ? 'All' : dept.replace('dept_', 'Dept ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 px-3 py-2 text-sm flex items-center justify-between gap-2 w-[120px]">
              <div className="flex items-center gap-2 overflow-hidden">
                <Power className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-50">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Add User button - only visible on desktop next to filters */}
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="bg-blue-800 hover:bg-blue-900 hidden lg:flex"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
        
        {/* Spacer to push Add User to right on desktop */}
        <div className="flex-1 hidden lg:block" />
        
        {/* Mobile Add User button */}
        <Button 
          onClick={() => setIsAddModalOpen(true)} 
          className="bg-blue-800 hover:bg-blue-900 w-full lg:hidden"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <UserTable
        users={filteredUsers}
        selectedUsers={selectedUsers}
        onSelectUser={handleSelectUser}
        onSelectAll={handleSelectAll}
        onEdit={(user) => {
          setSelectedUser(user);
          setIsEditModalOpen(true);
        }}
        onChangeRole={(user) => {
          setSelectedUser(user);
          setIsRoleModalOpen(true);
        }}
        onEditPermissions={(user) => {
          setSelectedUser(user);
          setIsPermissionsModalOpen(true);
        }}
        onResetPassword={handleResetPassword}
        onToggleActive={handleToggleActive}
        onImpersonate={handleImpersonate}
        canManageRoles={canManageRoles}
        canImpersonate={canImpersonate}
        currentUserId={currentUser.id}
      />

      {/* Add User Modal */}
      <UserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddUser}
        mode="add"
        availableRoles={availableRolesForAdd}
      />

      {/* Edit User Modal */}
      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleEditUser}
        user={selectedUser}
        mode="edit"
        availableRoles={availableRolesForEdit}
      />

      {/* Change Role Modal - Only for super_admin */}
      {isSuperAdmin && (
        <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Role for {selectedUser?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select
                value={selectedUser?.role}
                onValueChange={(value) => handleChangeRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loan_officer">Loan Officer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end">
                <Button onClick={() => setIsRoleModalOpen(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Permissions Editor */}
      <PermissionsEditor
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleEditPermissions}
        user={selectedUser}
      />

      {/* Reset Password Modal */}
      <Dialog open={isResetPasswordModalOpen} onOpenChange={setIsResetPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-700" />
              Password Reset Link
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Share this link with <strong>{selectedUser?.name}</strong> to reset their password:
            </p>
            <div className="p-3 bg-slate-50 border rounded-lg">
              <code className="text-sm break-all text-slate-700">
                {window.location.origin}/reset-password/{resetToken}
              </code>
            </div>
            <p className="text-xs text-slate-500">
              This link will expire in 24 hours.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
