import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import { useFinanceData } from '../context/FinanceDataContext';

export default function BudgetInput() {
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const { state, dispatch } = useFinanceData();

  const addBudget = () => {
    if (!amount || isNaN(Number(amount))) return;
    const budgetItem = {
      income_interest: Number(amount),
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
      customService: {
        OT: [],
        SLD: [],
        PHYSC: [],
        APA: []
      }
    };
    dispatch({
      type: 'UPDATE_BUDGET_ITEM',
      payload: { key: period, item: budgetItem }
    });
    setAmount('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Budget Input</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField label="Budget Amount" value={amount} onChange={e => setAmount(e.target.value)} size="small" sx={{ mr: 2 }} />
        <TextField label="Period (YYYY-MM)" value={period} onChange={e => setPeriod(e.target.value)} size="small" sx={{ mr: 2 }} />
        <Button variant="contained" onClick={addBudget}>Add</Button>
      </Paper>
      <Typography variant="h6">Budget Entries</Typography>
      <ul>
        {Object.entries(state.budget).map(([key, item]) => (
          <li key={key}>{key}: {item.income_interest + item.income_other}</li>
        ))}
      </ul>
    </Box>
  );
}
