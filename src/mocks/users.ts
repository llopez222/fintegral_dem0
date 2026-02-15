import type { User } from '@/types';

export type UserRole = 'loan_officer' | 'processor' | 'underwriter' | 'admin' | 'manager';

export interface ExtendedUser extends Omit<User, 'role'> {
  role: UserRole;
  department: string;
}

export const mockUsers: ExtendedUser[] = [
  {
    id: 'user_1',
    name: 'John Smith',
    email: 'john.smith@fintegral.com',
    role: 'loan_officer',
    department: 'dept_1',
    avatar: undefined,
  },
  {
    id: 'user_2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@fintegral.com',
    role: 'loan_officer',
    department: 'dept_1',
    avatar: undefined,
  },
  {
    id: 'user_3',
    name: 'Mike Manager',
    email: 'mike.manager@fintegral.com',
    role: 'manager',
    department: 'dept_1',
    avatar: undefined,
  },
];

export const getUserById = (id: string): ExtendedUser | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getDefaultUser = (): ExtendedUser => mockUsers[0];
