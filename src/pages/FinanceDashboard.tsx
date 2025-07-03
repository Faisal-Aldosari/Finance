import React, { useState, useEffect } from 'react';
import { useFinanceData } from '../context/FinanceDataContext';
import { 
  FinanceRecord, 
  CustomServiceCategories, 
  BudgetItem,
  Analytics 
} from '../context/FinanceDataContext';
import { ProfitChart, BankChart, BalanceChart } from '../components/Charts';
import './FinanceDashboard.css';

// Custom Service Row Component
const CustomServiceRow: React.FC<{
  item: { name: string; value: number };
  index: number;
  category: keyof CustomServiceCategories;
  onRemove: (category: keyof CustomServiceCategories, index: number) => void;
  onChange: (category: keyof CustomServiceCategories, index: number, field: 'name' | 'value', value: string | number) => void;
}> = ({ item, index, category, onRemove, onChange }) => {
  return (
    <div className="custom-service-row">
      <input
        type="text"
        value={item.name}
        placeholder="Employee name"
        maxLength={40}
        onChange={(e) => onChange(category, index, 'name', e.target.value)}
      />
      <input
        type="number"
        min="0"
        value={item.value}
        onChange={(e) => onChange(category, index, 'value', Number(e.target.value))}
      />
      <button type="button" onClick={() => onRemove(category, index)}>
        ✕
      </button>
    </div>
  );
};

// Period Bar Component
const PeriodBar: React.FC = () => {
  const { state, dispatch } = useFinanceData();
  const [formData, setFormData] = useState({
    periodType: state.periodType,
    startPeriod: state.startPeriod,
    endPeriod: state.endPeriod
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_PERIOD_TYPE', payload: formData.periodType });
    dispatch({ 
      type: 'SET_PERIOD_RANGE', 
      payload: { startPeriod: formData.startPeriod, endPeriod: formData.endPeriod } 
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      dispatch({ type: 'CLEAR_ALL_DATA' });
    }
  };

  return (
    <form className="period-bar" onSubmit={handleSubmit}>
      <label htmlFor="periodType">Period:</label>
      <select
        id="periodType"
        value={formData.periodType}
        onChange={(e) => setFormData({ ...formData, periodType: e.target.value as 'month' | 'quarter' | 'year' })}
      >
        <option value="month">Month</option>
        <option value="quarter">Quarter</option>
        <option value="year">Year</option>
      </select>
      
      <label htmlFor="startPeriod">From:</label>
      <input
        type={formData.periodType === 'month' ? 'month' : formData.periodType === 'year' ? 'number' : 'text'}
        id="startPeriod"
        value={formData.startPeriod}
        placeholder={formData.periodType === 'quarter' ? 'YYYY-Qn' : formData.periodType === 'year' ? 'YYYY' : ''}
        onChange={(e) => setFormData({ ...formData, startPeriod: e.target.value })}
      />
      
      <label htmlFor="endPeriod">To:</label>
      <input
        type={formData.periodType === 'month' ? 'month' : formData.periodType === 'year' ? 'number' : 'text'}
        id="endPeriod"
        value={formData.endPeriod}
        placeholder={formData.periodType === 'quarter' ? 'YYYY-Qn' : formData.periodType === 'year' ? 'YYYY' : ''}
        onChange={(e) => setFormData({ ...formData, endPeriod: e.target.value })}
      />
      
      <button type="submit" className="btn">Apply</button>
      <button type="button" className="btn danger" onClick={handleClearAll}>
        Clear All Data
      </button>
    </form>
  );
};

// Budget Section Component
const BudgetSection: React.FC = () => {
  const { state, dispatch } = useFinanceData();
  const [budgetPeriod, setBudgetPeriod] = useState(state.selectedBudgetPeriod);
  const [budgetFormData, setBudgetFormData] = useState<BudgetItem>({
    income_interest: 0,
    income_other: 0,
    expense_cogs: 0,
    expense_rent: 0,
    expense_utilities: 0,
    expense_salaries: 0,
    expense_marketing: 0,
    expense_other: 0,
    assets: 0,
    liabilities: 0,
    equity: 0,
    customService: { OT: [], SLD: [], PHYSC: [], APA: [] }
  });
  const [budgetError, setBudgetError] = useState('');

  useEffect(() => {
    if (state.selectedBudgetPeriod && state.budget[state.selectedBudgetPeriod]) {
      setBudgetFormData(state.budget[state.selectedBudgetPeriod]);
    }
  }, [state.selectedBudgetPeriod, state.budget]);

  const handleBudgetPeriodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_BUDGET_PERIOD', payload: budgetPeriod });
    dispatch({ type: 'SET_BUDGET_CUSTOM_SERVICE', payload: budgetFormData.customService });
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const budgetData = {
        ...budgetFormData,
        customService: state.budgetCustomService
      };
      dispatch({ 
        type: 'UPDATE_BUDGET_ITEM', 
        payload: { key: state.selectedBudgetPeriod, item: budgetData } 
      });
      setBudgetError('Budget saved!');
      setTimeout(() => setBudgetError(''), 1200);
    } catch (error) {
      setBudgetError('Invalid input.');
    }
  };

  const handleCustomServiceAdd = (category: keyof CustomServiceCategories) => {
    if (state.budgetCustomService[category].length >= 10) return;
    dispatch({
      type: 'ADD_BUDGET_CUSTOM_SERVICE',
      payload: { category, item: { name: '', value: 0 } }
    });
  };

  const handleCustomServiceRemove = (category: keyof CustomServiceCategories, index: number) => {
    dispatch({
      type: 'REMOVE_BUDGET_CUSTOM_SERVICE',
      payload: { category, index }
    });
  };

  const handleCustomServiceChange = (
    category: keyof CustomServiceCategories,
    index: number,
    field: 'name' | 'value',
    value: string | number
  ) => {
    const newCustomService = { ...state.budgetCustomService };
    if (field === 'name') {
      newCustomService[category][index].name = String(value).slice(0, 40);
    } else {
      newCustomService[category][index].value = Number(value) >= 0 ? Number(value) : 0;
    }
    dispatch({ type: 'SET_BUDGET_CUSTOM_SERVICE', payload: newCustomService });
  };

  return (
    <div className="budget-section">
      <h2>Set Your Budget</h2>
      
      <form className="budget-bar" onSubmit={handleBudgetPeriodSubmit}>
        <label htmlFor="budgetPeriod">Budget Month:</label>
        <input
          type="month"
          id="budgetPeriod"
          value={budgetPeriod}
          onChange={(e) => setBudgetPeriod(e.target.value)}
        />
        <button type="submit" className="btn">Select</button>
      </form>

      <form onSubmit={handleBudgetSubmit}>
        <div className="budget-grid">
          <div className="budget-card">
            <span style={{ fontSize: '2em' }}>💰</span>
            <label>Service Revenue</label>
            
            {(['OT', 'SLD', 'PHYSC', 'APA'] as const).map(category => (
              <div key={category}>
                <label>{category}</label>
                <div>
                  {state.budgetCustomService[category].map((item, index) => (
                    <CustomServiceRow
                      key={index}
                      item={item}
                      index={index}
                      category={category}
                      onRemove={handleCustomServiceRemove}
                      onChange={handleCustomServiceChange}
                    />
                  ))}
                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleCustomServiceAdd(category)}
                  >
                    Employee name
                  </button>
                </div>
              </div>
            ))}
            
            <label htmlFor="budget_income_interest">Interest Income</label>
            <input
              type="number"
              id="budget_income_interest"
              min="0"
              value={budgetFormData.income_interest}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, income_interest: Number(e.target.value) })}
            />
            
            <label htmlFor="budget_income_other">Other Income</label>
            <input
              type="number"
              id="budget_income_other"
              min="0"
              value={budgetFormData.income_other}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, income_other: Number(e.target.value) })}
            />
          </div>

          <div className="budget-card">
            <span style={{ fontSize: '2em' }}>💸</span>
            <label>Expenses</label>
            
            <label htmlFor="budget_expense_cogs">COGS</label>
            <input
              type="number"
              id="budget_expense_cogs"
              min="0"
              value={budgetFormData.expense_cogs}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, expense_cogs: Number(e.target.value) })}
            />
            
            <label htmlFor="budget_expense_rent">Rent</label>
            <input
              type="number"
              id="budget_expense_rent"
              min="0"
              value={budgetFormData.expense_rent}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, expense_rent: Number(e.target.value) })}
            />
            
            <label htmlFor="budget_expense_utilities">Utilities</label>
            <input
              type="number"
              id="budget_expense_utilities"
              min="0"
              value={budgetFormData.expense_utilities}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, expense_utilities: Number(e.target.value) })}
            />
            
            <label htmlFor="budget_expense_salaries">Salaries</label>
            <input
              type="number"
              id="budget_expense_salaries"
              min="0"
              value={budgetFormData.expense_salaries}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, expense_salaries: Number(e.target.value) })}
            />
            
            <label htmlFor="budget_expense_marketing">Marketing</label>
            <input
              type="number"
              id="budget_expense_marketing"
              min="0"
              value={budgetFormData.expense_marketing}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, expense_marketing: Number(e.target.value) })}
            />
            
            <label htmlFor="budget_expense_other">Other Expenses</label>
            <input
              type="number"
              id="budget_expense_other"
              min="0"
              value={budgetFormData.expense_other}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, expense_other: Number(e.target.value) })}
            />
          </div>

          <div className="budget-card">
            <span style={{ fontSize: '2em' }}>🏦</span>
            <label htmlFor="budget_assets">Assets</label>
            <input
              type="number"
              id="budget_assets"
              min="0"
              value={budgetFormData.assets}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, assets: Number(e.target.value) })}
            />
          </div>

          <div className="budget-card">
            <span style={{ fontSize: '2em' }}>💳</span>
            <label htmlFor="budget_liabilities">Liabilities</label>
            <input
              type="number"
              id="budget_liabilities"
              min="0"
              value={budgetFormData.liabilities}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, liabilities: Number(e.target.value) })}
            />
          </div>

          <div className="budget-card">
            <span style={{ fontSize: '2em' }}>📈</span>
            <label htmlFor="budget_equity">Equity</label>
            <input
              type="number"
              id="budget_equity"
              min="0"
              value={budgetFormData.equity}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, equity: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="budget-actions">
          <button type="submit" className="btn">Save Budget</button>
          <span className="budget-error" style={{ color: '#ff7f7f' }}>{budgetError}</span>
        </div>
      </form>
    </div>
  );
};

// Finance Form Component
const FinanceForm: React.FC = () => {
  const { state, dispatch, generateRecordId, validateRecord } = useFinanceData();
  const [formData, setFormData] = useState<Partial<FinanceRecord>>({
    date: '',
    income_interest: 0,
    income_other: 0,
    expense_cogs: 0,
    expense_rent: 0,
    expense_utilities: 0,
    expense_salaries: 0,
    expense_marketing: 0,
    expense_other: 0,
    assets: 0,
    liabilities: 0,
    equity: 0,
    bank_in: 0,
    bank_out: 0
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (state.editingRecord) {
      setFormData(state.editingRecord);
    }
  }, [state.editingRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateRecord(formData);
    if (error) {
      setFormError(error);
      return;
    }

    const record: FinanceRecord = {
      id: state.editingRecord ? state.editingRecord.id : generateRecordId(),
      date: formData.date || '',
      income_interest: Number(formData.income_interest) || 0,
      income_other: Number(formData.income_other) || 0,
      expense_cogs: Number(formData.expense_cogs) || 0,
      expense_rent: Number(formData.expense_rent) || 0,
      expense_utilities: Number(formData.expense_utilities) || 0,
      expense_salaries: Number(formData.expense_salaries) || 0,
      expense_marketing: Number(formData.expense_marketing) || 0,
      expense_other: Number(formData.expense_other) || 0,
      assets: Number(formData.assets) || 0,
      liabilities: Number(formData.liabilities) || 0,
      equity: Number(formData.equity) || 0,
      bank_in: Number(formData.bank_in) || 0,
      bank_out: Number(formData.bank_out) || 0,
      customService: state.customService
    };

    if (state.editingRecord) {
      dispatch({ type: 'UPDATE_RECORD', payload: record });
      dispatch({ type: 'SET_EDITING_RECORD', payload: null });
    } else {
      // Check for duplicate date
      if (state.records.some(r => r.date === record.date)) {
        setFormError('A record for this date already exists. Edit it instead.');
        return;
      }
      dispatch({ type: 'ADD_RECORD', payload: record });
    }

    // Reset form
    setFormData({
      date: '',
      income_interest: 0,
      income_other: 0,
      expense_cogs: 0,
      expense_rent: 0,
      expense_utilities: 0,
      expense_salaries: 0,
      expense_marketing: 0,
      expense_other: 0,
      assets: 0,
      liabilities: 0,
      equity: 0,
      bank_in: 0,
      bank_out: 0
    });
    dispatch({ type: 'SET_CUSTOM_SERVICE', payload: { OT: [], SLD: [], PHYSC: [], APA: [] } });
    setFormError('');
  };

  const handleCancel = () => {
    dispatch({ type: 'SET_EDITING_RECORD', payload: null });
    setFormData({
      date: '',
      income_interest: 0,
      income_other: 0,
      expense_cogs: 0,
      expense_rent: 0,
      expense_utilities: 0,
      expense_salaries: 0,
      expense_marketing: 0,
      expense_other: 0,
      assets: 0,
      liabilities: 0,
      equity: 0,
      bank_in: 0,
      bank_out: 0
    });
    dispatch({ type: 'SET_CUSTOM_SERVICE', payload: { OT: [], SLD: [], PHYSC: [], APA: [] } });
    setFormError('');
  };

  const handleCustomServiceAdd = (category: keyof CustomServiceCategories) => {
    if (state.customService[category].length >= 10) return;
    dispatch({
      type: 'ADD_CUSTOM_SERVICE',
      payload: { category, item: { name: '', value: 0 } }
    });
  };

  const handleCustomServiceRemove = (category: keyof CustomServiceCategories, index: number) => {
    dispatch({
      type: 'REMOVE_CUSTOM_SERVICE',
      payload: { category, index }
    });
  };

  const handleCustomServiceChange = (
    category: keyof CustomServiceCategories,
    index: number,
    field: 'name' | 'value',
    value: string | number
  ) => {
    const newCustomService = { ...state.customService };
    if (field === 'name') {
      newCustomService[category][index].name = String(value).slice(0, 40);
    } else {
      newCustomService[category][index].value = Number(value) >= 0 ? Number(value) : 0;
    }
    dispatch({ type: 'SET_CUSTOM_SERVICE', payload: newCustomService });
  };

  return (
    <form className="form-section" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="month"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="category-group">
        <div className="category-title">Income</div>
        <label>Service Revenue</label>
        
        {(['OT', 'SLD', 'PHYSC', 'APA'] as const).map(category => (
          <div key={category}>
            <label>{category}</label>
            <div>
              {state.customService[category].map((item, index) => (
                <CustomServiceRow
                  key={index}
                  item={item}
                  index={index}
                  category={category}
                  onRemove={handleCustomServiceRemove}
                  onChange={handleCustomServiceChange}
                />
              ))}
              <button
                type="button"
                className="btn"
                onClick={() => handleCustomServiceAdd(category)}
              >
                Employee name
              </button>
            </div>
          </div>
        ))}
        
        <label>Interest Income</label>
        <input
          type="number"
          min="0"
          value={formData.income_interest}
          onChange={(e) => setFormData({ ...formData, income_interest: Number(e.target.value) })}
        />
        
        <label>Other Income</label>
        <input
          type="number"
          min="0"
          value={formData.income_other}
          onChange={(e) => setFormData({ ...formData, income_other: Number(e.target.value) })}
        />
      </div>

      <div className="category-group">
        <div className="category-title">Expenses</div>
        <label>Cost of Goods Sold (COGS)</label>
        <input
          type="number"
          min="0"
          value={formData.expense_cogs}
          onChange={(e) => setFormData({ ...formData, expense_cogs: Number(e.target.value) })}
        />
        
        <label>Rent</label>
        <input
          type="number"
          min="0"
          value={formData.expense_rent}
          onChange={(e) => setFormData({ ...formData, expense_rent: Number(e.target.value) })}
        />
        
        <label>Utilities</label>
        <input
          type="number"
          min="0"
          value={formData.expense_utilities}
          onChange={(e) => setFormData({ ...formData, expense_utilities: Number(e.target.value) })}
        />
        
        <label>Salaries</label>
        <input
          type="number"
          min="0"
          value={formData.expense_salaries}
          onChange={(e) => setFormData({ ...formData, expense_salaries: Number(e.target.value) })}
        />
        
        <label>Marketing</label>
        <input
          type="number"
          min="0"
          value={formData.expense_marketing}
          onChange={(e) => setFormData({ ...formData, expense_marketing: Number(e.target.value) })}
        />
        
        <label>Other Expenses</label>
        <input
          type="number"
          min="0"
          value={formData.expense_other}
          onChange={(e) => setFormData({ ...formData, expense_other: Number(e.target.value) })}
        />
      </div>

      <div className="category-group">
        <div className="category-title">Balance Sheet</div>
        <label>Assets</label>
        <input
          type="number"
          min="0"
          value={formData.assets}
          onChange={(e) => setFormData({ ...formData, assets: Number(e.target.value) })}
        />
        
        <label>Liabilities</label>
        <input
          type="number"
          min="0"
          value={formData.liabilities}
          onChange={(e) => setFormData({ ...formData, liabilities: Number(e.target.value) })}
        />
        
        <label>Equity</label>
        <input
          type="number"
          min="0"
          value={formData.equity}
          onChange={(e) => setFormData({ ...formData, equity: Number(e.target.value) })}
        />
      </div>

      <div className="category-group">
        <div className="category-title">Bank (Cash)</div>
        <div className="bank-row">
          <label>Money Put In</label>
          <input
            type="number"
            min="0"
            value={formData.bank_in}
            onChange={(e) => setFormData({ ...formData, bank_in: Number(e.target.value) })}
          />
          
          <label>Money Taken Out</label>
          <input
            type="number"
            min="0"
            value={formData.bank_out}
            onChange={(e) => setFormData({ ...formData, bank_out: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn">
          {state.editingRecord ? 'Save Changes' : 'Add Record'}
        </button>
        {state.editingRecord && (
          <button type="button" className="btn" onClick={handleCancel}>
            Cancel Edit
          </button>
        )}
        <span className="form-error" style={{ color: '#ff7f7f' }}>{formError}</span>
      </div>
    </form>
  );
};

// Summary Cards Component
const SummaryCards: React.FC<{ analytics: Analytics }> = ({ analytics }) => {
  const { formatCurrency, formatDate } = useFinanceData();

  const cards = [
    { title: 'Total Income', value: formatCurrency(analytics.totalIncome), negative: false },
    { title: 'Total Expenses', value: formatCurrency(analytics.totalExpenses), negative: false },
    { title: 'Gross Profit', value: formatCurrency(analytics.grossProfit), negative: analytics.grossProfit < 0 },
    { title: 'Net Profit', value: formatCurrency(analytics.netProfit), negative: analytics.netProfit < 0 },
    { title: 'Gross Margin', value: `${analytics.grossMargin.toFixed(1)}%`, negative: analytics.grossMargin < 0 },
    { title: 'Net Margin', value: `${analytics.netMargin.toFixed(1)}%`, negative: analytics.netMargin < 0 },
    { title: 'Avg. Net', value: formatCurrency(analytics.avgNetProfit), negative: analytics.avgNetProfit < 0 },
    { 
      title: 'Highest Net', 
      value: (
        <div>
          {formatCurrency(analytics.highestNet)}
          {analytics.highestNetDate && <div style={{ fontSize: '0.8em', color: '#2E2C6E' }}>{formatDate(analytics.highestNetDate)}</div>}
        </div>
      ),
      negative: analytics.highestNet < 0
    },
    { 
      title: 'Lowest Net', 
      value: (
        <div>
          {formatCurrency(analytics.lowestNet)}
          {analytics.lowestNetDate && <div style={{ fontSize: '0.8em', color: '#2E2C6E' }}>{formatDate(analytics.lowestNetDate)}</div>}
        </div>
      ),
      negative: analytics.lowestNet < 0
    },
    { title: 'Bank (Cash) Net', value: formatCurrency(analytics.totalBankNet), negative: analytics.totalBankNet < 0 }
  ];

  return (
    <div className="card-row">
      {cards.map((card, index) => (
        <div key={index} className="card">
          <div className="card-title">{card.title}</div>
          <div className={`card-value ${card.negative ? 'negative' : ''}`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};

// Report Table Component
const ReportTable: React.FC<{ records: FinanceRecord[] }> = ({ records }) => {
  const { calculateTotals, formatCurrency } = useFinanceData();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (recordId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedRows(newExpanded);
  };

  const handleEdit = (record: FinanceRecord) => {
    // This would trigger the edit functionality
    console.log('Edit record:', record);
  };

  const handleDelete = (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      // This would trigger the delete functionality
      console.log('Delete record:', recordId);
    }
  };

  if (records.length === 0) {
    return (
      <div className="section">
        <h2>Financial Records</h2>
        <p>No records to display.</p>
      </div>
    );
  }

  return (
    <div className="section">
      <h2>Financial Records</h2>
      <div className="table-container">
        <table className="summary-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Interest Income</th>
              <th>Other Income</th>
              <th>Custom Service Revenue</th>
              <th>COGS</th>
              <th>Rent</th>
              <th>Utilities</th>
              <th>Salaries</th>
              <th>Marketing</th>
              <th>Other Expenses</th>
              <th>Assets</th>
              <th>Liabilities</th>
              <th>Equity</th>
              <th>Bank In</th>
              <th>Bank Out</th>
              <th>Gross Profit</th>
              <th>Net Profit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const totals = calculateTotals(record);
              const customServiceTotal = (['OT', 'SLD', 'PHYSC', 'APA'] as const).reduce((sum, type) => {
                return sum + (record.customService[type]?.reduce((s, item) => s + (Number(item.value) || 0), 0) || 0);
              }, 0);
              const isExpanded = expandedRows.has(record.id);

              return (
                <React.Fragment key={record.id}>
                  <tr>
                    <td>{record.date}</td>
                    <td>{formatCurrency(record.income_interest)}</td>
                    <td>{formatCurrency(record.income_other)}</td>
                    <td>
                      {formatCurrency(customServiceTotal)}
                      <button 
                        className="expand-btn" 
                        onClick={() => toggleRow(record.id)}
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    </td>
                    <td>{formatCurrency(record.expense_cogs)}</td>
                    <td>{formatCurrency(record.expense_rent)}</td>
                    <td>{formatCurrency(record.expense_utilities)}</td>
                    <td>{formatCurrency(record.expense_salaries)}</td>
                    <td>{formatCurrency(record.expense_marketing)}</td>
                    <td>{formatCurrency(record.expense_other)}</td>
                    <td>{formatCurrency(record.assets)}</td>
                    <td>{formatCurrency(record.liabilities)}</td>
                    <td>{formatCurrency(record.equity)}</td>
                    <td>{formatCurrency(record.bank_in)}</td>
                    <td>{formatCurrency(record.bank_out)}</td>
                    <td className={totals.grossProfit < 0 ? 'negative' : 'positive'}>
                      {formatCurrency(totals.grossProfit)}
                    </td>
                    <td className={totals.netProfit < 0 ? 'negative' : 'positive'}>
                      {formatCurrency(totals.netProfit)}
                    </td>
                    <td>
                      <button onClick={() => handleEdit(record)}>✎</button>
                      <button onClick={() => handleDelete(record.id)}>🗑️</button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="expand-row">
                      <td colSpan={18}>
                        <strong>Custom Service Revenue Details:</strong>
                        <div style={{ display: 'flex', gap: '2em', flexWrap: 'wrap' }}>
                          {(['OT', 'SLD', 'PHYSC', 'APA'] as const).map(type => (
                            <div key={type}>
                              <strong>{type}:</strong>
                              <ul style={{ margin: 0, paddingInlineStart: '1em' }}>
                                {record.customService[type]?.length === 0 ? (
                                  <li>None</li>
                                ) : (
                                  record.customService[type]?.map((item, index) => (
                                    <li key={index}>
                                      {item.name}: {formatCurrency(item.value)}
                                    </li>
                                  ))
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Finance Dashboard Component
const FinanceDashboard: React.FC = () => {
  const { state, filterRecordsByPeriod, getAnalytics, calculateTotals, groupByPeriod } = useFinanceData();
  const [filteredRecords, setFilteredRecords] = useState<FinanceRecord[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
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
  });

  useEffect(() => {
    const filtered = filterRecordsByPeriod();
    const records = filtered.length > 0 ? filtered : state.records;
    setFilteredRecords(records);
    setAnalytics(getAnalytics(records));
  }, [state.records, state.startPeriod, state.endPeriod, state.periodType]);

  return (
    <div className="finance-dashboard">
      <div className="container">
        <h1>Ability Finance Reporting</h1>
        
        <PeriodBar />
        <BudgetSection />
        <FinanceForm />
        
        {filteredRecords.length > 0 && (
          <>
            <div className="section">
              <h2>Profit Over Time</h2>
              <ProfitChart 
                records={filteredRecords} 
                calculateTotals={calculateTotals}
                groupByPeriod={groupByPeriod}
                periodType={state.periodType}
              />
            </div>
            
            <div className="section">
              <h2>Bank (Cash) Over Time</h2>
              <BankChart 
                records={filteredRecords} 
                calculateTotals={calculateTotals}
                groupByPeriod={groupByPeriod}
                periodType={state.periodType}
              />
            </div>
            
            <div className="section">
              <h2>Balance Sheet Comparison</h2>
              <BalanceChart 
                records={filteredRecords} 
                calculateTotals={calculateTotals}
                groupByPeriod={groupByPeriod}
                periodType={state.periodType}
              />
            </div>
          </>
        )}
        
        <SummaryCards analytics={analytics} />
        <ReportTable records={filteredRecords} />
        
        <footer className="footer">
          Created by Faisal Aldosari
        </footer>
      </div>
    </div>
  );
};

export default FinanceDashboard;
