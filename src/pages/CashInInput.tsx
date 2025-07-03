import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import { useFinanceData } from '../context/FinanceDataContext';

export default function CashInInput() {
  const [cash, setCash] = useState('');
  const [desc, setDesc] = useState('');
  const { state, dispatch } = useFinanceData();

  const addCash = () => {
    if (!cash || isNaN(Number(cash))) return;
    const newRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 7), // YYYY-MM format
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
      bank_in: Number(cash),
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
    setCash('');
    setDesc('');
  };

  const cashRecords = state.records.filter(r => r.bank_in > 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Cash In Input</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField label="Cash In Amount" value={cash} onChange={e => setCash(e.target.value)} size="small" sx={{ mr: 2 }} />
        <TextField label="Description" value={desc} onChange={e => setDesc(e.target.value)} size="small" sx={{ mr: 2 }} />
        <Button variant="contained" onClick={addCash}>Add</Button>
      </Paper>
      <Typography variant="h6">Entries</Typography>
      <ul>
        {cashRecords.map((e, i) => <li key={e.id || i}>{e.date}: {e.bank_in}</li>)}
      </ul>
    </Box>
  );
}
