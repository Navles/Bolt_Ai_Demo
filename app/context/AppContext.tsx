'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

interface Project {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'completed' | 'on-hold';
  contractValue: number;
  startDate: string;
  endDate: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendor' | 'procurement' | 'viewer';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>({
    id: '10M193',
    name: 'Infrastructure Development Project',
    code: '10M193',
    status: 'active',
    contractValue: 850000,
    startDate: '2024-01-01',
    endDate: '2025-12-31'
  });
  
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'admin'
  });

  return (
    <AppContext.Provider value={{
      currentProject,
      setCurrentProject,
      user,
      setUser
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}