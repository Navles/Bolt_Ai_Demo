'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface EstimationItem {
  id: string;
  productCode?: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  costHead: string;
}

export interface Estimation {
  id: string;
  projectId: string;
  costHead: string;
  category: string;
  vendor: string;
  estimatedBy: string;
  items: EstimationItem[];
  notes: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
}

export interface CRSReportData {
  slNo: string;
  particulars: string;
  estimate: number | null;
  committed: number | null;
  uncommitted: number | null;
  actual: number | null;
  anticipated: number | null;
  variance: number | null;
  variancePercent: number | null;
}

interface EstimationContextType {
  estimations: Estimation[];
  addEstimation: (estimation: Omit<Estimation, 'id' | 'createdAt' | 'updatedAt' | 'totalAmount'>) => void;
  updateEstimation: (id: string, estimation: Partial<Estimation>) => void;
  deleteEstimation: (id: string) => void;
  getEstimationById: (id: string) => Estimation | undefined;
  getEstimationsByProject: (projectId: string) => Estimation[];
  getCRSReportData: () => CRSReportData[];
  getTotalsByCostHead: () => Record<string, number>;
  getProjectSummary: () => {
    totalEstimate: number;
    totalCommitted: number;
    totalActual: number;
    totalVariance: number;
    variancePercent: number;
  };
}

const EstimationContext = createContext<EstimationContextType | undefined>(undefined);

// Cost head mapping for CRS report
const COST_HEAD_MAPPING: Record<string, string> = {
  'OM01 - Material Cost': 'MATERIAL COST',
  'OM02 - Manpower Cost': 'MANPOWER COST',
  'OM03 - Subcontracting Cost': 'SUBCONTRACTING COST',
  'OM04 - Equipment Cost': 'EQUIPMENT COST',
  'OM05 - Transportation Cost': 'TRANSPORTATION COST',
  'OM06 - Miscellaneous Cost': 'MISCELLANEOUS COST',
};

// Mock actual and committed data - in real app, this would come from purchase orders and actual expenses
const MOCK_ACTUAL_DATA: Record<string, { actual: number; committed: number }> = {
  'MATERIAL COST': { actual: 45000, committed: 42000 },
  'MANPOWER COST': { actual: 18000, committed: 15000 },
  'SUBCONTRACTING COST': { actual: 25000, committed: 28000 },
  'EQUIPMENT COST': { actual: 12000, committed: 10000 },
  'TRANSPORTATION COST': { actual: 8000, committed: 7500 },
  'MISCELLANEOUS COST': { actual: 5000, committed: 4500 },
};

export function EstimationProvider({ children }: { children: ReactNode }) {
  const [estimations, setEstimations] = useState<Estimation[]>([]);

  // Load estimations from localStorage on mount
  useEffect(() => {
    const savedEstimations = localStorage.getItem('estimations');
    if (savedEstimations) {
      try {
        setEstimations(JSON.parse(savedEstimations));
      } catch (error) {
        console.error('Error loading estimations from localStorage:', error);
      }
    }
  }, []);

  // Save estimations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('estimations', JSON.stringify(estimations));
  }, [estimations]);

  const addEstimation = (estimationData: Omit<Estimation, 'id' | 'createdAt' | 'updatedAt' | 'totalAmount'>) => {
    const totalAmount = estimationData.items.reduce((sum, item) => sum + item.totalCost, 0);
    const newEstimation: Estimation = {
      ...estimationData,
      id: `EST-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalAmount,
    };
    setEstimations(prev => [...prev, newEstimation]);
  };

  const updateEstimation = (id: string, updates: Partial<Estimation>) => {
    setEstimations(prev => prev.map(est => {
      if (est.id === id) {
        const updatedEst = { ...est, ...updates, updatedAt: new Date().toISOString() };
        if (updates.items) {
          updatedEst.totalAmount = updates.items.reduce((sum, item) => sum + item.totalCost, 0);
        }
        return updatedEst;
      }
      return est;
    }));
  };

  const deleteEstimation = (id: string) => {
    setEstimations(prev => prev.filter(est => est.id !== id));
  };

  const getEstimationById = (id: string) => {
    return estimations.find(est => est.id === id);
  };

  const getEstimationsByProject = (projectId: string) => {
    return estimations.filter(est => est.projectId === projectId);
  };

  const getTotalsByCostHead = () => {
    const totals: Record<string, number> = {};
    
    estimations.forEach(estimation => {
      if (estimation.status === 'approved' || estimation.status === 'submitted') {
        const mappedCostHead = COST_HEAD_MAPPING[estimation.costHead] || estimation.costHead;
        totals[mappedCostHead] = (totals[mappedCostHead] || 0) + estimation.totalAmount;
      }
    });

    return totals;
  };

  const getCRSReportData = (): CRSReportData[] => {
    const estimateTotals = getTotalsByCostHead();
    const reportData: CRSReportData[] = [];

    // Generate report data for each cost head
    Object.entries(COST_HEAD_MAPPING).forEach(([originalHead, mappedHead], index) => {
      const estimate = estimateTotals[mappedHead] || 0;
      const mockData = MOCK_ACTUAL_DATA[mappedHead] || { actual: 0, committed: 0 };
      const actual = mockData.actual;
      const committed = mockData.committed;
      const uncommitted = Math.max(0, estimate - committed);
      const anticipated = actual + uncommitted;
      const variance = anticipated - estimate;
      const variancePercent = estimate > 0 ? (variance / estimate) * 100 : 0;

      reportData.push({
        slNo: `OM${String(index + 1).padStart(2, '0')}`,
        particulars: mappedHead,
        estimate: estimate > 0 ? estimate : null,
        committed: committed > 0 ? committed : null,
        uncommitted: uncommitted > 0 ? uncommitted : null,
        actual: actual > 0 ? actual : null,
        anticipated: anticipated > 0 ? anticipated : null,
        variance: Math.abs(variance) > 0 ? variance : null,
        variancePercent: Math.abs(variancePercent) > 0.01 ? variancePercent : null,
      });
    });

    // Filter out rows with no data
    return reportData.filter(row => 
      row.estimate !== null || 
      row.committed !== null || 
      row.actual !== null
    );
  };

  const getProjectSummary = () => {
    const reportData = getCRSReportData();
    const totalEstimate = reportData.reduce((sum, item) => sum + (item.estimate || 0), 0);
    const totalCommitted = reportData.reduce((sum, item) => sum + (item.committed || 0), 0);
    const totalActual = reportData.reduce((sum, item) => sum + (item.actual || 0), 0);
    const totalVariance = reportData.reduce((sum, item) => sum + (item.variance || 0), 0);
    const variancePercent = totalEstimate > 0 ? (totalVariance / totalEstimate) * 100 : 0;

    return {
      totalEstimate,
      totalCommitted,
      totalActual,
      totalVariance,
      variancePercent,
    };
  };

  return (
    <EstimationContext.Provider value={{
      estimations,
      addEstimation,
      updateEstimation,
      deleteEstimation,
      getEstimationById,
      getEstimationsByProject,
      getCRSReportData,
      getTotalsByCostHead,
      getProjectSummary,
    }}>
      {children}
    </EstimationContext.Provider>
  );
}

export function useEstimation() {
  const context = useContext(EstimationContext);
  if (context === undefined) {
    throw new Error('useEstimation must be used within an EstimationProvider');
  }
  return context;
}