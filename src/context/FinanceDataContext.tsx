import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types for all financial data
export interface Actual {
  id: string;
  departmentId: string;
  amount: number;
  description?: string;
}
export interface Budget {
  id: string;
  departmentId: string;
  amount: number;
  description?: string;
}
export interface Department {
  id: string;
  name: string;
}
export interface CashIn {
  id: string;
  amount: number;
  description?: string;
}

export interface FinanceDataContextType {
  actuals: Actual[];
  setActuals: React.Dispatch<React.SetStateAction<Actual[]>>;
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  cashIns: CashIn[];
  setCashIns: React.Dispatch<React.SetStateAction<CashIn[]>>;
  // Derived summary
  summary: {
    profit: number;
    netProfit: number;
    grossMargin: number;
  };
}

const FinanceDataContext = createContext<FinanceDataContextType | undefined>(undefined);

export function useFinanceData() {
  const ctx = useContext(FinanceDataContext);
  if (!ctx) throw new Error('useFinanceData must be used within FinanceDataProvider');
  return ctx;
}

export function FinanceDataProvider({ children }: { children: ReactNode }) {
  const [actuals, setActuals] = useState<Actual[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cashIns, setCashIns] = useState<CashIn[]>([]);

  // Simple summary logic (customize as needed)
  const totalActuals = actuals.reduce((sum, a) => sum + a.amount, 0);
  const totalBudgets = budgets.reduce((sum, b) => sum + b.amount, 0);
  const profit = totalActuals - totalBudgets;
  const grossMargin = profit * 0.6; // Example logic
  const netProfit = profit * 0.8;   // Example logic

  return (
    <FinanceDataContext.Provider value={{
      actuals, setActuals,
      budgets, setBudgets,
      departments, setDepartments,
      cashIns, setCashIns,
      summary: { profit, netProfit, grossMargin },
    }}>
      {children}
    </FinanceDataContext.Provider>
  );
}
