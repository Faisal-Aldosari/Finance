import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
export interface CustomServiceItem {
  name: string;
  value: number;
}

export interface CustomServiceCategories {
  OT: CustomServiceItem[];
  SLD: CustomServiceItem[];
  PHYSC: CustomServiceItem[];
  APA: CustomServiceItem[];
}

export interface FinanceRecord {
  id: string;
  date: string; // YYYY-MM format
  income_interest: number;
  income_other: number;
  expense_cogs: number;
  expense_rent: number;
  expense_utilities: number;
  expense_salaries: number;
  expense_marketing: number;
  expense_other: number;
  assets: number;
  liabilities: number;
  equity: number;
  bank_in: number;
  bank_out: number;
  customService: CustomServiceCategories;
}

export interface BudgetItem {
  income_interest: number;
  income_other: number;
  expense_cogs: number;
  expense_rent: number;
  expense_utilities: number;
  expense_salaries: number;
  expense_marketing: number;
  expense_other: number;
  assets: number;
  liabilities: number;
  equity: number;
  customService: CustomServiceCategories;
}

export interface Budget {
  [key: string]: BudgetItem; // key is YYYY-MM format
}

export interface CalculatedTotals {
  totalIncome: number;
  cogs: number;
  grossProfit: number;
  otherExpenses: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  bankNet: number;
}

export interface Analytics {
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  totalIncome: number;
  totalExpenses: number;
  avgNetProfit: number;
  highestNet: number;
  highestNetDate: string;
  lowestNet: number;
  lowestNetDate: string;
  assets: number;
  liabilities: number;
  equity: number;
  totalBankNet: number;
}

export interface GroupedPeriod {
  period: string;
  assets: number;
  liabilities: number;
  equity: number;
  income: number;
  expenses: number;
  netProfit: number;
  grossMargin: number;
  bankNet: number;
  records: FinanceRecord[];
}

export interface FinanceState {
  records: FinanceRecord[];
  budget: Budget;
  periodType: 'month' | 'quarter' | 'year';
  startPeriod: string;
  endPeriod: string;
  selectedBudgetPeriod: string;
  editingRecord: FinanceRecord | null;
  customService: CustomServiceCategories;
  budgetCustomService: CustomServiceCategories;
  isLoading: boolean;
  error: string | null;
}

type FinanceAction =
  | { type: 'SET_RECORDS'; payload: FinanceRecord[] }
  | { type: 'ADD_RECORD'; payload: FinanceRecord }
  | { type: 'UPDATE_RECORD'; payload: FinanceRecord }
  | { type: 'DELETE_RECORD'; payload: string }
  | { type: 'SET_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET_ITEM'; payload: { key: string; item: BudgetItem } }
  | { type: 'SET_PERIOD_TYPE'; payload: 'month' | 'quarter' | 'year' }
  | { type: 'SET_PERIOD_RANGE'; payload: { startPeriod: string; endPeriod: string } }
  | { type: 'SET_BUDGET_PERIOD'; payload: string }
  | { type: 'SET_EDITING_RECORD'; payload: FinanceRecord | null }
  | { type: 'SET_CUSTOM_SERVICE'; payload: CustomServiceCategories }
  | { type: 'SET_BUDGET_CUSTOM_SERVICE'; payload: CustomServiceCategories }
  | { type: 'ADD_CUSTOM_SERVICE'; payload: { category: keyof CustomServiceCategories; item: CustomServiceItem } }
  | { type: 'REMOVE_CUSTOM_SERVICE'; payload: { category: keyof CustomServiceCategories; index: number } }
  | { type: 'ADD_BUDGET_CUSTOM_SERVICE'; payload: { category: keyof CustomServiceCategories; item: CustomServiceItem } }
  | { type: 'REMOVE_BUDGET_CUSTOM_SERVICE'; payload: { category: keyof CustomServiceCategories; index: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ALL_DATA' };

const initialState: FinanceState = {
  records: [],
  budget: {},
  periodType: 'month',
  startPeriod: '',
  endPeriod: '',
  selectedBudgetPeriod: '',
  editingRecord: null,
  customService: { OT: [], SLD: [], PHYSC: [], APA: [] },
  budgetCustomService: { OT: [], SLD: [], PHYSC: [], APA: [] },
  isLoading: false,
  error: null
};

// Utility functions
const cleanRecords = (records: any[]): FinanceRecord[] => {
  if (!Array.isArray(records)) return [];
  return records.filter(r =>
    r && typeof r.date === 'string' &&
    !isNaN(new Date(r.date).getTime()) &&
    ['income_interest', 'income_other', 'expense_cogs', 'expense_rent', 'expense_utilities', 'expense_salaries', 'expense_marketing', 'expense_other', 'assets', 'liabilities', 'equity', 'bank_in', 'bank_out'].every(
      k => typeof r[k] === 'number' || typeof r[k] === 'undefined'
    )
  );
};

const validateCustomService = (customService: any): CustomServiceCategories => {
  const defaultCategories: CustomServiceCategories = { OT: [], SLD: [], PHYSC: [], APA: [] };
  if (!customService || typeof customService !== 'object') return defaultCategories;
  
  const result: CustomServiceCategories = { ...defaultCategories };
  Object.keys(defaultCategories).forEach(key => {
    if (Array.isArray(customService[key])) {
      result[key as keyof CustomServiceCategories] = customService[key].map((item: any) => ({
        name: String(item.name || '').slice(0, 40),
        value: Number(item.value) >= 0 ? Number(item.value) : 0
      }));
    }
  });
  return result;
};

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'SET_RECORDS':
      return { ...state, records: action.payload };
    case 'ADD_RECORD':
      return { ...state, records: [...state.records, action.payload] };
    case 'UPDATE_RECORD':
      return {
        ...state,
        records: state.records.map(record =>
          record.id === action.payload.id ? action.payload : record
        )
      };
    case 'DELETE_RECORD':
      return {
        ...state,
        records: state.records.filter(record => record.id !== action.payload)
      };
    case 'SET_BUDGET':
      return { ...state, budget: action.payload };
    case 'UPDATE_BUDGET_ITEM':
      return {
        ...state,
        budget: { ...state.budget, [action.payload.key]: action.payload.item }
      };
    case 'SET_PERIOD_TYPE':
      return { ...state, periodType: action.payload };
    case 'SET_PERIOD_RANGE':
      return { ...state, startPeriod: action.payload.startPeriod, endPeriod: action.payload.endPeriod };
    case 'SET_BUDGET_PERIOD':
      return { ...state, selectedBudgetPeriod: action.payload };
    case 'SET_EDITING_RECORD':
      return { ...state, editingRecord: action.payload };
    case 'SET_CUSTOM_SERVICE':
      return { ...state, customService: action.payload };
    case 'SET_BUDGET_CUSTOM_SERVICE':
      return { ...state, budgetCustomService: action.payload };
    case 'ADD_CUSTOM_SERVICE':
      return {
        ...state,
        customService: {
          ...state.customService,
          [action.payload.category]: [...state.customService[action.payload.category], action.payload.item]
        }
      };
    case 'REMOVE_CUSTOM_SERVICE':
      return {
        ...state,
        customService: {
          ...state.customService,
          [action.payload.category]: state.customService[action.payload.category].filter((_, index) => index !== action.payload.index)
        }
      };
    case 'ADD_BUDGET_CUSTOM_SERVICE':
      return {
        ...state,
        budgetCustomService: {
          ...state.budgetCustomService,
          [action.payload.category]: [...state.budgetCustomService[action.payload.category], action.payload.item]
        }
      };
    case 'REMOVE_BUDGET_CUSTOM_SERVICE':
      return {
        ...state,
        budgetCustomService: {
          ...state.budgetCustomService,
          [action.payload.category]: state.budgetCustomService[action.payload.category].filter((_, index) => index !== action.payload.index)
        }
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ALL_DATA':
      return { ...initialState };
    default:
      return state;
  }
}

// Context
const FinanceDataContext = createContext<{
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
  // Helper functions
  calculateTotals: (record: FinanceRecord) => CalculatedTotals;
  getAnalytics: (records: FinanceRecord[]) => Analytics;
  filterRecordsByPeriod: () => FinanceRecord[];
  groupByPeriod: (records: FinanceRecord[], period: string) => GroupedPeriod[];
  saveToStorage: () => void;
  loadFromStorage: () => void;
  setDefaultPeriod: () => void;
  generateRecordId: () => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  validateRecord: (record: Partial<FinanceRecord>) => string | null;
} | null>(null);

// Provider
export const FinanceDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  // Helper functions
  const calculateTotals = (record: FinanceRecord): CalculatedTotals => {
    let totalCustomService = 0;
    (['OT', 'SLD', 'PHYSC', 'APA'] as const).forEach(type => {
      totalCustomService += record.customService[type]?.reduce((sum, s) => sum + (Number(s.value) || 0), 0) || 0;
    });
    
    const totalIncome = totalCustomService +
      (Number(record.income_interest) || 0) +
      (Number(record.income_other) || 0);
    
    const cogs = Number(record.expense_cogs) || 0;
    const otherExpenses = (Number(record.expense_rent) || 0) + (Number(record.expense_utilities) || 0) +
      (Number(record.expense_salaries) || 0) + (Number(record.expense_marketing) || 0) +
      (Number(record.expense_other) || 0);
    
    const grossProfit = totalIncome - cogs;
    const netProfit = grossProfit - otherExpenses;
    const grossMargin = totalIncome !== 0 ? (grossProfit / totalIncome) * 100 : 0;
    const netMargin = totalIncome !== 0 ? (netProfit / totalIncome) * 100 : 0;
    const bankNet = (Number(record.bank_in) || 0) - (Number(record.bank_out) || 0);
    
    return { totalIncome, cogs, grossProfit, otherExpenses, netProfit, grossMargin, netMargin, bankNet };
  };

  const getAnalytics = (records: FinanceRecord[]): Analytics => {
    if (records.length === 0) {
      return {
        grossProfit: 0,
        netProfit: 0,
        grossMargin: 0,
        netMargin: 0,
        totalIncome: 0,
        totalExpenses: 0,
        avgNetProfit: 0,
        highestNet: 0,
        highestNetDate: '',
        lowestNet: 0,
        lowestNetDate: '',
        assets: 0,
        liabilities: 0,
        equity: 0,
        totalBankNet: 0
      };
    }
    
    let totalIncome = 0, totalCOGS = 0, totalOtherExp = 0, totalGross = 0, totalNet = 0;
    let highestNet = -Infinity, lowestNet = Infinity;
    let highestNetDate = '', lowestNetDate = '';
    let assets = 0, liabilities = 0, equity = 0;
    let totalBankNet = 0;
    
    records.forEach(r => {
      const t = calculateTotals(r);
      totalIncome += t.totalIncome;
      totalCOGS += t.cogs;
      totalOtherExp += t.otherExpenses;
      totalGross += t.grossProfit;
      totalNet += t.netProfit;
      assets += Number(r.assets || 0);
      liabilities += Number(r.liabilities || 0);
      equity += Number(r.equity || 0);
      totalBankNet += t.bankNet;
      
      if (t.netProfit > highestNet) {
        highestNet = t.netProfit;
        highestNetDate = r.date;
      }
      if (t.netProfit < lowestNet) {
        lowestNet = t.netProfit;
        lowestNetDate = r.date;
      }
    });
    
    const grossMargin = totalIncome !== 0 ? (totalGross / totalIncome) * 100 : 0;
    const netMargin = totalIncome !== 0 ? (totalNet / totalIncome) * 100 : 0;
    const avgNetProfit = totalNet / records.length;
    const totalExpenses = totalCOGS + totalOtherExp;
    
    return {
      grossProfit: totalGross,
      netProfit: totalNet,
      grossMargin,
      netMargin,
      totalIncome,
      totalExpenses,
      avgNetProfit,
      highestNet,
      highestNetDate,
      lowestNet,
      lowestNetDate,
      assets,
      liabilities,
      equity,
      totalBankNet
    };
  };

  const filterRecordsByPeriod = (): FinanceRecord[] => {
    if (!state.startPeriod || !state.endPeriod) return [];
    
    if (state.periodType === 'month') {
      return state.records.filter(r => r.date.slice(0, 7) >= state.startPeriod && r.date.slice(0, 7) <= state.endPeriod);
    } else if (state.periodType === 'quarter') {
      const toQuarterKey = (date: string) => {
        const [y, m] = date.split('-');
        return `${y}-Q${Math.floor((parseInt(m) - 1) / 3) + 1}`;
      };
      const quarterCompare = (a: string, b: string) => {
        const [ay, aq] = a.split('-Q').map(Number);
        const [by, bq] = b.split('-Q').map(Number);
        if (ay !== by) return ay - by;
        return aq - bq;
      };
      return state.records.filter(r => 
        quarterCompare(toQuarterKey(r.date), state.startPeriod) >= 0 && 
        quarterCompare(toQuarterKey(r.date), state.endPeriod) <= 0
      );
    } else if (state.periodType === 'year') {
      return state.records.filter(r => r.date.slice(0, 4) >= state.startPeriod && r.date.slice(0, 4) <= state.endPeriod);
    }
    return [];
  };

  const groupByPeriod = (records: FinanceRecord[], period: string): GroupedPeriod[] => {
    const groups: { [key: string]: FinanceRecord[] } = {};
    records.forEach(r => {
      let key = '';
      if (period === 'month') key = r.date.slice(0, 7);
      else if (period === 'quarter') {
        const [year, month] = r.date.split('-').map(Number);
        const q = Math.floor((month - 1) / 3) + 1;
        key = `${year}-Q${q}`;
      } else if (period === 'year') key = r.date.slice(0, 4);
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    
    return Object.entries(groups).map(([k, v]) => ({
      period: k,
      assets: v.reduce((a, r) => a + Number(r.assets || 0), 0),
      liabilities: v.reduce((a, r) => a + Number(r.liabilities || 0), 0),
      equity: v.reduce((a, r) => a + Number(r.equity || 0), 0),
      income: v.reduce((a, r) => a + calculateTotals(r).totalIncome, 0),
      expenses: v.reduce((a, r) => a + calculateTotals(r).cogs + calculateTotals(r).otherExpenses, 0),
      netProfit: v.reduce((a, r) => a + calculateTotals(r).netProfit, 0),
      grossMargin: v.reduce((a, r) => a + calculateTotals(r).grossMargin, 0) / v.length,
      bankNet: v.reduce((a, r) => a + calculateTotals(r).bankNet, 0),
      records: v
    }));
  };

  const saveToStorage = () => {
    try {
      localStorage.setItem('ability_finance_records', JSON.stringify(state.records));
      localStorage.setItem('ability_finance_budget', JSON.stringify(state.budget));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const loadFromStorage = () => {
    try {
      const records = localStorage.getItem('ability_finance_records');
      const budget = localStorage.getItem('ability_finance_budget');
      
      if (records) {
        const parsedRecords = cleanRecords(JSON.parse(records));
        // Ensure all records have proper customService structure
        const validRecords = parsedRecords.map(r => ({
          ...r,
          customService: validateCustomService(r.customService)
        }));
        dispatch({ type: 'SET_RECORDS', payload: validRecords });
      }
      
      if (budget) {
        const parsedBudget = JSON.parse(budget);
        // Validate budget structure
        const validBudget: Budget = {};
        Object.keys(parsedBudget).forEach(key => {
          if (parsedBudget[key] && typeof parsedBudget[key] === 'object') {
            validBudget[key] = {
              ...parsedBudget[key],
              customService: validateCustomService(parsedBudget[key].customService)
            };
          }
        });
        dispatch({ type: 'SET_BUDGET', payload: validBudget });
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  const setDefaultPeriod = () => {
    if (state.records.length === 0) return;
    
    const dates = state.records.map(r => r.date).sort();
    
    if (state.periodType === 'month') {
      const startPeriod = dates[0].slice(0, 7);
      const endPeriod = dates[dates.length - 1].slice(0, 7);
      dispatch({ type: 'SET_PERIOD_RANGE', payload: { startPeriod, endPeriod } });
    } else if (state.periodType === 'quarter') {
      const toQuarter = (d: string) => {
        const [y, m] = d.split('-');
        return `${y}-Q${Math.floor((parseInt(m) - 1) / 3) + 1}`;
      };
      const startPeriod = toQuarter(dates[0]);
      const endPeriod = toQuarter(dates[dates.length - 1]);
      dispatch({ type: 'SET_PERIOD_RANGE', payload: { startPeriod, endPeriod } });
    } else if (state.periodType === 'year') {
      const startPeriod = dates[0].slice(0, 4);
      const endPeriod = dates[dates.length - 1].slice(0, 4);
      dispatch({ type: 'SET_PERIOD_RANGE', payload: { startPeriod, endPeriod } });
    }
  };

  const generateRecordId = (): string => {
    return `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: string): string => {
    if (!date) return '';
    try {
      const [year, month] = date.split('-');
      if (!year || !month) return date;
      const d = new Date(Number(year), Number(month) - 1);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return date;
    }
  };

  const validateRecord = (record: Partial<FinanceRecord>): string | null => {
    if (!record.date) return 'Date is required';
    if (!record.date.match(/^\d{4}-\d{2}$/)) return 'Date must be in YYYY-MM format';
    
    const numericFields = ['income_interest', 'income_other', 'expense_cogs', 'expense_rent', 'expense_utilities', 'expense_salaries', 'expense_marketing', 'expense_other', 'assets', 'liabilities', 'equity', 'bank_in', 'bank_out'];
    for (const field of numericFields) {
      const value = record[field as keyof FinanceRecord];
      if (value !== undefined && (isNaN(Number(value)) || Number(value) < 0)) {
        return `${field} must be a valid non-negative number`;
      }
    }
    
    return null;
  };

  // Auto-save when records or budget change
  useEffect(() => {
    if (state.records.length > 0 || Object.keys(state.budget).length > 0) {
      saveToStorage();
    }
  }, [state.records, state.budget]);

  // Load data on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Set default period when records change
  useEffect(() => {
    if (state.records.length > 0 && (!state.startPeriod || !state.endPeriod)) {
      setDefaultPeriod();
    }
  }, [state.records, state.periodType]);

  return (
    <FinanceDataContext.Provider value={{
      state,
      dispatch,
      calculateTotals,
      getAnalytics,
      filterRecordsByPeriod,
      groupByPeriod,
      saveToStorage,
      loadFromStorage,
      setDefaultPeriod,
      generateRecordId,
      formatCurrency,
      formatDate,
      validateRecord
    }}>
      {children}
    </FinanceDataContext.Provider>
  );
};

// Hook
export const useFinanceData = () => {
  const context = useContext(FinanceDataContext);
  if (!context) {
    throw new Error('useFinanceData must be used within a FinanceDataProvider');
  }
  return context;
};

export type { FinanceAction };
