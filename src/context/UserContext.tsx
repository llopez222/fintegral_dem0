import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { ExtendedUser } from '@/mocks/users';
import { mockUsers, getDefaultUser } from '@/mocks/users';

interface UserContextType {
  currentUser: ExtendedUser;
  setCurrentUser: (user: ExtendedUser) => void;
  isManager: boolean;
  availableUsers: ExtendedUser[];
}

const STORAGE_KEY = 'fintegral_current_user';

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUserState] = useState<ExtendedUser>(() => {
    // Try to load from localStorage on init
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as ExtendedUser;
          // Validate that the stored user exists in mockUsers
          const validUser = mockUsers.find(u => u.id === parsed.id);
          if (validUser) return validUser;
        } catch {
          // Invalid stored data, fall through to default
        }
      }
    }
    return getDefaultUser();
  });

  const setCurrentUser = useCallback((user: ExtendedUser) => {
    setCurrentUserState(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    // Trigger a storage event for cross-tab synchronization
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(user),
    }));
  }, []);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as ExtendedUser;
          const validUser = mockUsers.find(u => u.id === parsed.id);
          if (validUser) {
            setCurrentUserState(validUser);
          }
        } catch {
          // Ignore invalid data
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isManager = useMemo(() => currentUser.role === 'manager', [currentUser.role]);

  const value = useMemo(() => ({
    currentUser,
    setCurrentUser,
    isManager,
    availableUsers: mockUsers,
  }), [currentUser, setCurrentUser, isManager]);

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
