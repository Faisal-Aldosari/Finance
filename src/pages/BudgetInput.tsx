import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import { useFinanceData } from '../context/FinanceDataContext';

export default function BudgetInput() {
  const [budget, setBudget] = useState('');
  const [desc, setDesc] = useState('');
  const { budgets, setBudgets } = useFinanceData();

  const addBudget = () => {
    if (!budget || isNaN(Number(budget))) return;
    setBudgets([...budgets, { id: Date.now().toString(), departmentId: '', amount: Number(budget), description: desc }]);
    setBudget('');
    setDesc('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Budget Input</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField label="Budget Amount" value={budget} onChange={e => setBudget(e.target.value)} size="small" sx={{ mr: 2 }} />
        <TextField label="Description" value={desc} onChange={e => setDesc(e.target.value)} size="small" sx={{ mr: 2 }} />
        <Button variant="contained" onClick={addBudget}>Add</Button>
      </Paper>
      <Typography variant="h6">Entries</Typography>
      <ul>
        {budgets.map((e, i) => <li key={e.id || i}>{e.description}: {e.amount}</li>)}
      </ul>
    </Box>
  );
}
