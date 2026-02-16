import { useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { getRoleDisplayName } from '@/mocks/users';

export function ImpersonationBanner() {
  const { isImpersonating, originalUser, currentUser, stopImpersonating } = useUser();

  // Set data attribute on body for global styling
  useEffect(() => {
    if (isImpersonating) {
      document.body.setAttribute('data-impersonating', 'true');
    } else {
      document.body.removeAttribute('data-impersonating');
    }
    return () => {
      document.body.removeAttribute('data-impersonating');
    };
  }, [isImpersonating]);

  if (!isImpersonating || !originalUser || !currentUser) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-400 border-b border-amber-500 shadow-md" data-impersonating-banner>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <User className="w-4 h-4 text-amber-900" />
            </div>
            <span className="text-sm font-medium text-amber-900">
              Viewing as <strong>{currentUser.name}</strong> 
              <span className="text-amber-800"> ({getRoleDisplayName(currentUser.role)})</span>
            </span>
            <span className="text-xs text-amber-800 bg-amber-300 px-2 py-0.5 rounded-full">
              {currentUser.department === 'all' ? 'All Departments' : currentUser.department}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-800 hidden sm:inline">
              Original: {originalUser.name}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={stopImpersonating}
              className="h-8 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Exit Impersonation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
