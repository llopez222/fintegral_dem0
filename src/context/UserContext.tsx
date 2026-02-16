import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { ExtendedUser, Permissions } from '@/mocks/users';
import { mockUsers, authenticateUser, getUserById } from '@/mocks/users';

// Storage keys
const STORAGE_KEY_USER = 'fintegral_user';
const STORAGE_KEY_IMPERSONATING = 'fintegral_impersonating';

interface ImpersonationState {
  isImpersonating: boolean;
  originalUser: ExtendedUser | null;
}

interface UserContextType {
  // User state
  currentUser: ExtendedUser | null;
  isAuthenticated: boolean;
  
  // Impersonation state
  isImpersonating: boolean;
  originalUser: ExtendedUser | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  impersonate: (userId: string) => boolean;
  stopImpersonating: () => void;
  
  // Permissions
  hasPermission: (permission: keyof Permissions) => boolean;
  canImpersonate: () => boolean;
  
  // Role checks - only 3 roles
  isSuperAdmin: boolean;
  isManager: boolean;
  isLoanOfficer: boolean;
  
  // Available users (for switcher)
  availableUsers: ExtendedUser[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  // Main user state
  const [currentUser, setCurrentUserState] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Impersonation state
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [originalUser, setOriginalUser] = useState<ExtendedUser | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load impersonation state first
        const storedImpersonating = localStorage.getItem(STORAGE_KEY_IMPERSONATING);
        if (storedImpersonating) {
          const parsed: ImpersonationState = JSON.parse(storedImpersonating);
          if (parsed.isImpersonating && parsed.originalUser) {
            // Validate original user exists
            const validOriginal = mockUsers.find(u => u.id === parsed.originalUser?.id);
            if (validOriginal && validOriginal.permissions.impersonateUsers) {
              setOriginalUser(validOriginal);
              setIsImpersonating(true);
            }
          }
        }

        // Load current user
        const storedUser = localStorage.getItem(STORAGE_KEY_USER);
        if (storedUser) {
          const parsed = JSON.parse(storedUser) as ExtendedUser;
          const validUser = mockUsers.find(u => u.id === parsed.id);
          if (validUser) {
            setCurrentUserState(validUser);
          }
        }
      } catch {
        // Invalid stored data, ignore
      }
      setIsLoading(false);
    }
  }, []);

  // Persist current user to localStorage
  const persistUser = useCallback((user: ExtendedUser | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, []);

  // Persist impersonation state
  const persistImpersonation = useCallback((state: ImpersonationState) => {
    if (state.isImpersonating && state.originalUser) {
      localStorage.setItem(STORAGE_KEY_IMPERSONATING, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY_IMPERSONATING);
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const user = authenticateUser(email, password);
    if (user) {
      setCurrentUserState(user);
      persistUser(user);
      // Clear any previous impersonation on fresh login
      setIsImpersonating(false);
      setOriginalUser(null);
      persistImpersonation({ isImpersonating: false, originalUser: null });
      return true;
    }
    return false;
  }, [persistUser, persistImpersonation]);

  // Logout function
  const logout = useCallback(() => {
    setCurrentUserState(null);
    setIsImpersonating(false);
    setOriginalUser(null);
    persistUser(null);
    persistImpersonation({ isImpersonating: false, originalUser: null });
  }, [persistUser, persistImpersonation]);

  // Impersonate another user (only for super_admin)
  const impersonate = useCallback((userId: string): boolean => {
    // Must be logged in and have impersonation permission
    if (!currentUser || !currentUser.permissions.impersonateUsers) {
      return false;
    }

    const targetUser = getUserById(userId);
    if (!targetUser) {
      return false;
    }

    // Can't impersonate yourself
    if (targetUser.id === currentUser.id) {
      return false;
    }

    // Save original user if not already impersonating
    if (!isImpersonating) {
      setOriginalUser(currentUser);
      persistImpersonation({ isImpersonating: true, originalUser: currentUser });
    }

    setCurrentUserState(targetUser);
    persistUser(targetUser);
    setIsImpersonating(true);
    
    return true;
  }, [currentUser, isImpersonating, persistUser, persistImpersonation]);

  // Stop impersonating and return to original user
  const stopImpersonating = useCallback(() => {
    if (originalUser && isImpersonating) {
      setCurrentUserState(originalUser);
      persistUser(originalUser);
      setIsImpersonating(false);
      setOriginalUser(null);
      persistImpersonation({ isImpersonating: false, originalUser: null });
    }
  }, [originalUser, isImpersonating, persistUser, persistImpersonation]);

  // Check if current user has a specific permission
  const hasPermission = useCallback((permission: keyof Permissions): boolean => {
    if (!currentUser) return false;
    return currentUser.permissions[permission] === true;
  }, [currentUser]);

  // Check if current user can impersonate others
  const canImpersonate = useCallback((): boolean => {
    if (!currentUser) return false;
    return currentUser.permissions.impersonateUsers === true;
  }, [currentUser]);

  // Role checks - only 3 roles: super_admin, manager, loan_officer
  const isSuperAdmin = useMemo(() => currentUser?.role === 'super_admin', [currentUser]);
  const isManager = useMemo(() => currentUser?.role === 'manager', [currentUser]);
  const isLoanOfficer = useMemo(() => currentUser?.role === 'loan_officer', [currentUser]);

  // Derived state
  const isAuthenticated = useMemo(() => currentUser !== null, [currentUser]);

  // Context value
  const value = useMemo(() => ({
    currentUser,
    isAuthenticated,
    isImpersonating,
    originalUser,
    login,
    logout,
    impersonate,
    stopImpersonating,
    hasPermission,
    canImpersonate,
    isSuperAdmin,
    isManager,
    isLoanOfficer,
    availableUsers: mockUsers,
  }), [
    currentUser, 
    isAuthenticated, 
    isImpersonating, 
    originalUser,
    login, 
    logout, 
    impersonate, 
    stopImpersonating,
    hasPermission,
    canImpersonate,
    isSuperAdmin,
    isManager,
    isLoanOfficer,
 ]);

  if (isLoading) {
    // You could return a loading spinner here
    return null;
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
