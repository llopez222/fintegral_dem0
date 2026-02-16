import type { User } from '@/types';

// Simplified roles - only 3: super_admin, manager, loan_officer
export type UserRole = 
  | 'loan_officer' 
  | 'manager'
  | 'super_admin';

// Granular permissions interface
export interface Permissions {
  viewOwnPipeline: boolean;
  viewDepartmentPipeline: boolean;
  viewAllDepartments: boolean;
  manageUsers: boolean;
  manageRoles: boolean;
  editAnyLoan: boolean;
  viewAnalytics: boolean;
  systemSettings: boolean;
  impersonateUsers: boolean;
}

// Default permissions by role - ONLY 3 ROLES
export const getDefaultPermissions = (role: UserRole): Permissions => {
  switch (role) {
    case 'super_admin':
      return {
        viewOwnPipeline: true,
        viewDepartmentPipeline: true,
        viewAllDepartments: true,
        manageUsers: true,
        manageRoles: true,
        editAnyLoan: true,
        viewAnalytics: true,
        systemSettings: true,
        impersonateUsers: true,
      };
    case 'manager':
      return {
        viewOwnPipeline: true,
        viewDepartmentPipeline: true,
        viewAllDepartments: false,
        manageUsers: true, // Can manage users in their department
        manageRoles: false,
        editAnyLoan: false, // Can only edit loans in their department
        viewAnalytics: true,
        systemSettings: false,
        impersonateUsers: false, // Managers cannot impersonate
      };
    case 'loan_officer':
    default:
      return {
        viewOwnPipeline: true,
        viewDepartmentPipeline: false,
        viewAllDepartments: false,
        manageUsers: false,
        manageRoles: false,
        editAnyLoan: false,
        viewAnalytics: false,
        systemSettings: false,
        impersonateUsers: false,
      };
  }
};

export interface ExtendedUser extends Omit<User, 'role'> {
  role: UserRole;
  department: string;
  permissions: Permissions;
  assignedLoans?: string[]; // Loan IDs assigned to this user
  avatar?: string;
}

// Simplified mockUsers - only 5 users, NO admin role
export const mockUsers: ExtendedUser[] = [
  // 1. Super Admin - can impersonate, manage all
  {
    id: 'super_1',
    name: 'Super Admin',
    email: 'admin@fintegral.com',
    role: 'super_admin',
    department: 'all',
    permissions: getDefaultPermissions('super_admin'),
    avatar: undefined,
  },
  // 2. Manager - dept_1, can manage users in dept_1
  {
    id: 'user_3',
    name: 'Mike Manager',
    email: 'mike.manager@fintegral.com',
    role: 'manager',
    department: 'dept_1',
    permissions: getDefaultPermissions('manager'),
    assignedLoans: ['5'],
    avatar: undefined,
  },
  // 3. John Smith (LO) - dept_1
  {
    id: 'user_1',
    name: 'John Smith',
    email: 'john.smith@fintegral.com',
    role: 'loan_officer',
    department: 'dept_1',
    permissions: getDefaultPermissions('loan_officer'),
    assignedLoans: ['1', '2'],
    avatar: undefined,
  },
  // 4. Sarah Johnson (LO) - dept_1
  {
    id: 'user_2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@fintegral.com',
    role: 'loan_officer',
    department: 'dept_1',
    permissions: getDefaultPermissions('loan_officer'),
    assignedLoans: ['3', '4'],
    avatar: undefined,
  },
  // 5. Carlos Ruiz (LO) - dept_2
  {
    id: 'user_4',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@fintegral.com',
    role: 'loan_officer',
    department: 'dept_2',
    permissions: getDefaultPermissions('loan_officer'),
    assignedLoans: ['6'],
    avatar: undefined,
  },
];

// Login function - mock authentication
export const authenticateUser = (email: string, password: string): ExtendedUser | null => {
  if (password !== '123456') {
    return null;
  }
  
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
};

export const getUserById = (id: string): ExtendedUser | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getUserByEmail = (email: string): ExtendedUser | undefined => {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
};

export const getDefaultUser = (): ExtendedUser => mockUsers[2]; // John Smith as default for dev

// Helper to get role display name
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    loan_officer: 'Loan Officer',
    manager: 'Manager',
    super_admin: 'Super Admin',
  };
  return roleNames[role] || role;
};

// Helper to check if user can view another user's loans (for impersonation)
// ONLY super_admin can impersonate
export const canViewUserLoans = (viewer: ExtendedUser, targetUserId: string): boolean => {
  if (viewer.role === 'super_admin') return true;
  if (viewer.id === targetUserId) return true;
  if (viewer.role === 'manager') {
    const target = getUserById(targetUserId);
    if (target && target.department === viewer.department) return true;
  }
  return false;
};

// Helper to get users visible to a specific user
export const getVisibleUsers = (viewer: ExtendedUser): ExtendedUser[] => {
  if (viewer.role === 'super_admin') {
    return mockUsers; // Super admin sees all
  }
  if (viewer.role === 'manager') {
    // Manager sees users in their department + themselves
    return mockUsers.filter(u => u.department === viewer.department || u.id === viewer.id);
  }
  // Loan officer only sees themselves
  return mockUsers.filter(u => u.id === viewer.id);
};
