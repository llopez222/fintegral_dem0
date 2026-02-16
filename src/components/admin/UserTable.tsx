// User table component with selectable rows
import { MoreHorizontal, User, Shield, Power, PowerOff, LogIn, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type { ExtendedUser, UserRole } from '@/mocks/users';
import { getRoleDisplayName } from '@/mocks/users';

interface UserTableProps {
  users: ExtendedUser[];
  selectedUsers: string[];
  onSelectUser: (userId: string) => void;
  onSelectAll: () => void;
  onEdit: (user: ExtendedUser) => void;
  onChangeRole: (user: ExtendedUser) => void;
  onEditPermissions: (user: ExtendedUser) => void;
  onResetPassword: (user: ExtendedUser) => void;
  onToggleActive: (user: ExtendedUser) => void;
  onImpersonate: (user: ExtendedUser) => void;
  canManageRoles: boolean;
  canImpersonate: boolean;
  currentUserId: string;
}

// Simplified roles - only 3: super_admin, manager, loan_officer
const roleColors: Record<UserRole, string> = {
  super_admin: 'bg-purple-100 text-purple-700 border-purple-200',
  manager: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  loan_officer: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function UserTable({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onEdit,
  onChangeRole,
  onEditPermissions,
  onResetPassword,
  onToggleActive,
  onImpersonate,
  canManageRoles,
  canImpersonate,
  currentUserId,
}: UserTableProps) {
  const allSelected = users.length > 0 && selectedUsers.length === users.length;
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                data-state={someSelected ? 'indeterminate' : undefined}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                className={user.id === currentUserId ? 'bg-blue-50/50' : ''}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => onSelectUser(user.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-800 to-blue-950 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 flex items-center gap-2">
                        {user.name}
                        {user.id === currentUserId && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${roleColors[user.role]} capitalize`}
                  >
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-700">
                    {user.department === 'all' ? 'All Departments' : user.department}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.permissions.viewOwnPipeline ? 'default' : 'secondary'}
                    className={
                      user.permissions.viewOwnPipeline
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                    }
                  >
                    {user.permissions.viewOwnPipeline ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        Edit Details
                      </DropdownMenuItem>
                      
                      {canManageRoles && (
                        <DropdownMenuItem onClick={() => onChangeRole(user)}>
                          <Shield className="w-4 h-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem onClick={() => onEditPermissions(user)}>
                        <Shield className="w-4 h-4 mr-2" />
                        Edit Permissions
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => onResetPassword(user)}>
                        <Key className="w-4 h-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {canImpersonate && user.id !== currentUserId && (
                        <>
                          <DropdownMenuItem onClick={() => onImpersonate(user)}>
                            <LogIn className="w-4 h-4 mr-2" />
                            Impersonate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      
                      <DropdownMenuItem
                        onClick={() => onToggleActive(user)}
                        className={
                          user.permissions.viewOwnPipeline
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }
                      >
                        {user.permissions.viewOwnPipeline ? (
                          <>
                            <PowerOff className="w-4 h-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="w-4 h-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
