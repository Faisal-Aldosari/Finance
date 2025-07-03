import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import { useFinanceData } from '../context/FinanceDataContext';

export default function ActualsInput() {
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const { state, dispatch } = useFinanceData();

  const addActual = () => {
    if (!amount || isNaN(Number(amount))) return;
    const newRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 7), // YYYY-MM format
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
      bank_in: Number(amount),
      bank_out: 0,
      customService: {
        OT: [],
        SLD: [],
        PHYSC: [],
        APA: []
      }
    };
    dispatch({
      type: 'ADD_RECORD',
      payload: newRecord
    });
    setAmount('');
    setDesc('');
  };

  const actualRecords = state.records.filter(r => r.income_interest > 0 || r.income_other > 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Actuals Input</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField label="Amount" value={amount} onChange={e => setAmount(e.target.value)} size="small" sx={{ mr: 2 }} />
        <TextField label="Description" value={desc} onChange={e => setDesc(e.target.value)} size="small" sx={{ mr: 2 }} />
        <Button variant="contained" onClick={addActual}>Add</Button>
      </Paper>
      <Typography variant="h6">Entries</Typography>
      <ul>
        {actualRecords.map((e, i) => <li key={e.id || i}>{e.date}: {e.income_interest + e.income_other}</li>)}
      </ul>
    </Box>
  );
}
