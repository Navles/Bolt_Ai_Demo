'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface CCNItem {
  id: string;
  referenceType: 'estimation' | 'purchase_order' | 'actual_cost';
  referenceId: string;
  referenceNumber: string;
  itemDescription: string;
  originalCost: number;
  revisedCost: number;
  variance: number;
  variancePercent: number;
  reason: string;
  costHead: string;
}

export interface CostChangeNote {
  id: string;
  ccnNumber: string;
  projectId: string;
  changeType: 'increase' | 'decrease' | 'scope_change';
  category: 'material' | 'labor' | 'equipment' | 'overhead' | 'other';
  initiatedBy: string;
  reason: string;
  justification: string;
  items: CCNItem[];
  attachments: string[];
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  approvalRequired: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  effectiveDate: string;
  notes: string;
  totalVariance: number;
  totalOriginalCost: number;
  totalRevisedCost: number;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

interface CostChangeNoteContextType {
  costChangeNotes: CostChangeNote[];
  addCostChangeNote: (ccn: Omit<CostChangeNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCostChangeNote: (id: string, updates: Partial<CostChangeNote>) => void;
  deleteCostChangeNote: (id: string) => void;
  getCCNById: (id: string) => CostChangeNote | undefined;
  getCCNsByProject: (projectId: string) => CostChangeNote[];
  approveCCN: (id: string, approvedBy: string) => void;
  rejectCCN: (id: string, rejectionReason: string) => void;
  getCCNSummary: () => {
    totalCCNs: number;
    pendingApproval: number;
    approved: number;
    rejected: number;
    totalVariance: number;
    totalIncrease: number;
    totalDecrease: number;
  };
  getCCNsByStatus: (status: CostChangeNote['status']) => CostChangeNote[];
  getCCNImpactOnBudget: (projectId: string) => {
    originalBudget: number;
    revisedBudget: number;
    totalVariance: number;
    variancePercent: number;
    approvedVariance: number;
    pendingVariance: number;
  };
}

const CostChangeNoteContext = createContext<CostChangeNoteContextType | undefined>(undefined);

export function CostChangeNoteProvider({ children }: { children: ReactNode }) {
  const [costChangeNotes, setCostChangeNotes] = useState<CostChangeNote[]>([]);

  // Load CCNs from localStorage on mount
  useEffect(() => {
    const savedCCNs = localStorage.getItem('costChangeNotes');
    if (savedCCNs) {
      try {
        const parsed = JSON.parse(savedCCNs);
        console.log('Loaded CCNs from localStorage:', parsed);
        setCostChangeNotes(parsed);
      } catch (error) {
        console.error('Error loading CCNs from localStorage:', error);
      }
    }
  }, []);

  // Save CCNs to localStorage whenever they change
  useEffect(() => {
    if (costChangeNotes.length > 0) {
      console.log('Saving CCNs to localStorage:', costChangeNotes);
      localStorage.setItem('costChangeNotes', JSON.stringify(costChangeNotes));
    }
  }, [costChangeNotes]);

  const addCostChangeNote = (ccnData: Omit<CostChangeNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Adding CCN with data:', ccnData);
    
    const newCCN: CostChangeNote = {
      ...ccnData,
      id: `CCN-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('Final CCN to be added:', newCCN);
    setCostChangeNotes(prev => {
      const updated = [...prev, newCCN];
      console.log('Updated CCNs array:', updated);
      return updated;
    });
  };

  const updateCostChangeNote = (id: string, updates: Partial<CostChangeNote>) => {
    setCostChangeNotes(prev => prev.map(ccn => {
      if (ccn.id === id) {
        return { ...ccn, ...updates, updatedAt: new Date().toISOString() };
      }
      return ccn;
    }));
  };

  const deleteCostChangeNote = (id: string) => {
    setCostChangeNotes(prev => prev.filter(ccn => ccn.id !== id));
  };

  const getCCNById = (id: string) => {
    return costChangeNotes.find(ccn => ccn.id === id);
  };

  const getCCNsByProject = (projectId: string) => {
    return costChangeNotes.filter(ccn => ccn.projectId === projectId);
  };

  const approveCCN = (id: string, approvedBy: string) => {
    updateCostChangeNote(id, {
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString(),
    });
  };

  const rejectCCN = (id: string, rejectionReason: string) => {
    updateCostChangeNote(id, {
      status: 'rejected',
      rejectionReason,
    });
  };

  const getCCNsByStatus = (status: CostChangeNote['status']) => {
    return costChangeNotes.filter(ccn => ccn.status === status);
  };

  const getCCNSummary = () => {
    const totalCCNs = costChangeNotes.length;
    const pendingApproval = costChangeNotes.filter(ccn => ccn.status === 'submitted' || ccn.status === 'under_review').length;
    const approved = costChangeNotes.filter(ccn => ccn.status === 'approved').length;
    const rejected = costChangeNotes.filter(ccn => ccn.status === 'rejected').length;
    
    const totalVariance = costChangeNotes
      .filter(ccn => ccn.status === 'approved')
      .reduce((sum, ccn) => sum + ccn.totalVariance, 0);
    
    const totalIncrease = costChangeNotes
      .filter(ccn => ccn.status === 'approved' && ccn.totalVariance > 0)
      .reduce((sum, ccn) => sum + ccn.totalVariance, 0);
    
    const totalDecrease = Math.abs(costChangeNotes
      .filter(ccn => ccn.status === 'approved' && ccn.totalVariance < 0)
      .reduce((sum, ccn) => sum + ccn.totalVariance, 0));

    return {
      totalCCNs,
      pendingApproval,
      approved,
      rejected,
      totalVariance,
      totalIncrease,
      totalDecrease,
    };
  };

  const getCCNImpactOnBudget = (projectId: string) => {
    const projectCCNs = getCCNsByProject(projectId);
    const approvedCCNs = projectCCNs.filter(ccn => ccn.status === 'approved');
    const pendingCCNs = projectCCNs.filter(ccn => ccn.status === 'submitted' || ccn.status === 'under_review');
    
    const originalBudget = approvedCCNs.reduce((sum, ccn) => sum + ccn.totalOriginalCost, 0);
    const revisedBudget = approvedCCNs.reduce((sum, ccn) => sum + ccn.totalRevisedCost, 0);
    const totalVariance = revisedBudget - originalBudget;
    const variancePercent = originalBudget > 0 ? (totalVariance / originalBudget) * 100 : 0;
    
    const approvedVariance = approvedCCNs.reduce((sum, ccn) => sum + ccn.totalVariance, 0);
    const pendingVariance = pendingCCNs.reduce((sum, ccn) => sum + ccn.totalVariance, 0);

    return {
      originalBudget,
      revisedBudget,
      totalVariance,
      variancePercent,
      approvedVariance,
      pendingVariance,
    };
  };

  return (
    <CostChangeNoteContext.Provider value={{
      costChangeNotes,
      addCostChangeNote,
      updateCostChangeNote,
      deleteCostChangeNote,
      getCCNById,
      getCCNsByProject,
      approveCCN,
      rejectCCN,
      getCCNSummary,
      getCCNsByStatus,
      getCCNImpactOnBudget,
    }}>
      {children}
    </CostChangeNoteContext.Provider>
  );
}

export function useCostChangeNote() {
  const context = useContext(CostChangeNoteContext);
  if (context === undefined) {
    throw new Error('useCostChangeNote must be used within a CostChangeNoteProvider');
  }
  return context;
}