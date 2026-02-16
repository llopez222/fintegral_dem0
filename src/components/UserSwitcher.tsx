import { User, ChevronDown, LogOut, Crown, Users, UserCheck } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockUsers, getRoleDisplayName, type ExtendedUser, type UserRole } from '@/mocks/users';

// Role icons mapping - simplified to 3 roles
const roleIcons: Record<UserRole, typeof User> = {
  super_admin: Crown,
  manager: Users,
  loan_officer: UserCheck,
};

// Role colors for badges - simplified to 3 roles
const roleColors: Record<UserRole, string> = {
  super_admin: 'bg-purple-100 text-purple-700 border-purple-200',
  manager: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  loan_officer: 'bg-slate-100 text-slate-700 border-slate-200',
};

interface UserSwitcherProps {
  variant?: 'sidebar' | 'header';
}

export function UserSwitcher({ variant = 'sidebar' }: UserSwitcherProps) {
  const { 
    currentUser, 
    isImpersonating, 
    originalUser,
    impersonate, 
    stopImpersonating,
    canImpersonate,
    logout
  } = useUser();

  if (!currentUser) return null;

  const handleUserClick = (user: ExtendedUser) => {
    if (user.id === currentUser.id) return;
    
    // If can impersonate and is super_admin, impersonate
    if (canImpersonate()) {
      impersonate(user.id);
    }
  };

  const RoleIcon = roleIcons[currentUser.role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`flex items-center gap-3 px-3 py-2 h-auto justify-start hover:bg-slate-100 ${
            variant === 'sidebar' ? 'w-full' : ''
          }`}
        >
          <div className={`bg-gradient-to-br from-blue-800 to-blue-950 rounded-full flex items-center justify-center shrink-0 ${
            variant === 'sidebar' ? 'w-9 h-9' : 'w-8 h-8'
          }`}>
            <User className={`text-white ${variant === 'sidebar' ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-2">
              <p className={`font-medium text-slate-900 truncate ${variant === 'sidebar' ? 'text-sm' : 'text-sm'}`}>
                {currentUser.name}
              </p>
              {isImpersonating && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                  Impersonating
                </span>
              )}
            </div>
            <p className={`text-slate-500 truncate flex items-center gap-1 ${variant === 'sidebar' ? 'text-xs' : 'text-xs'}`}>
              <RoleIcon className="w-3 h-3" />
              {getRoleDisplayName(currentUser.role)}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72">
        {/* Current User Header */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-slate-900">{currentUser.name}</p>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${roleColors[currentUser.role]}`}>
                {getRoleDisplayName(currentUser.role)}
              </span>
              {currentUser.department !== 'all' && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {currentUser.department}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Stop Impersonation Option */}
        {isImpersonating && (
          <>
            <DropdownMenuItem 
              onClick={stopImpersonating}
              className="flex items-center gap-2 text-amber-700 bg-amber-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="font-medium">Stop Impersonating</span>
                <span className="text-xs text-amber-600">Return to {originalUser?.name}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* User List - Only show for super_admin when not impersonating */}
        {canImpersonate() && !isImpersonating && (
          <>
            <DropdownMenuLabel>Impersonate User</DropdownMenuLabel>
            {mockUsers
              .filter(user => user.id !== currentUser.id)
              .map((user) => {
                const UserRoleIcon = roleIcons[user.role];
                return (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-950 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <UserRoleIcon className="w-3 h-3 text-slate-400" />
                        <p className="text-xs text-slate-500 truncate">{getRoleDisplayName(user.role)}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${roleColors[user.role]}`}>
                      {user.department === 'all' ? 'All' : user.department}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Actions */}
        <DropdownMenuItem 
          onClick={logout}
          className="flex items-center gap-2 text-red-600 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
