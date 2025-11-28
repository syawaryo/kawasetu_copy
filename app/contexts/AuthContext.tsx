'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'applicant' | 'manager';

export interface User {
  id: string;
  name: string;
  department: string;
  role: UserRole;
  code: string;
}

// デモ用ユーザー3人
export const DEMO_USERS: User[] = [
  {
    id: 'user-tanaka',
    name: '田中 太郎',
    department: '工事部',
    role: 'applicant',
    code: '1234',
  },
  {
    id: 'user-suzuki',
    name: '鈴木 花子',
    department: '設備課',
    role: 'applicant',
    code: '5678',
  },
  {
    id: 'user-yamada',
    name: '山田 部長',
    department: '工事部',
    role: 'manager',
    code: '9999',
  },
];

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (code: string) => { success: boolean; error?: string };
  loginByIndex: (index: number) => boolean;
  logout: () => void;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初回マウント時にURLパラメータまたはlocalStorageから復元
  useEffect(() => {
    // URLパラメータをチェック
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');

    if (userParam) {
      const userIndex = parseInt(userParam, 10) - 1; // user=1 → index 0
      if (userIndex >= 0 && userIndex < DEMO_USERS.length) {
        const user = DEMO_USERS[userIndex];
        setCurrentUser(user);
        localStorage.setItem('kawasaki-demo-user', user.id);
        setIsLoading(false);
        return;
      }
    }

    // URLパラメータがなければlocalStorageから復元
    const savedUserId = localStorage.getItem('kawasaki-demo-user');
    if (savedUserId) {
      const user = DEMO_USERS.find(u => u.id === savedUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (code: string): { success: boolean; error?: string } => {
    const user = DEMO_USERS.find(u => u.code === code);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('kawasaki-demo-user', user.id);
      return { success: true };
    }
    return { success: false, error: 'コードが正しくありません' };
  };

  const loginByIndex = (index: number): boolean => {
    if (index >= 0 && index < DEMO_USERS.length) {
      const user = DEMO_USERS[index];
      setCurrentUser(user);
      localStorage.setItem('kawasaki-demo-user', user.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kawasaki-demo-user');
  };

  const getAllUsers = () => DEMO_USERS;

  // ローディング中は何も表示しない（ちらつき防止）
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        login,
        loginByIndex,
        logout,
        getAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
