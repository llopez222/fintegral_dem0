import { User, Check, ChevronDown } from 'lucide-react';
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
import type { ExtendedUser } from '@/mocks/users';

function getRoleDisplayName(role: ExtendedUser['role']): string {
  switch (role) {
    case 'loan_officer':
      return 'Loan Officer';
    case 'manager':
      return 'Manager';
    case 'processor':
      return 'Processor';
    case 'underwriter':
      return 'Underwriter';
    case 'admin':
      return 'Admin';
    default:
      return role;
  }
}

export function UserSwitcher() {
  const { currentUser, setCurrentUser, availableUsers } = useUser();

  const handleUserChange = (user: ExtendedUser) => {
    if (user.id !== currentUser.id) {
      setCurrentUser(user);
      // Refresh the page to apply the new user context throughout the app
      window.location.reload();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full flex items-center gap-3 px-3 py-2 h-auto justify-start hover:bg-slate-100"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-blue-800 to-blue-950 rounded-full flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-500 truncate">{getRoleDisplayName(currentUser.role)}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch User</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableUsers.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => handleUserChange(user)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-950 rounded-full flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{getRoleDisplayName(user.role)}</p>
            </div>
            {user.id === currentUser.id && (
              <Check className="w-4 h-4 text-blue-600 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
