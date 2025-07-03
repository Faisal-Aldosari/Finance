import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import { useFinanceData } from '../context/FinanceDataContext';

export default function CashInInput() {
  const [cash, setCash] = useState('');
  const [desc, setDesc] = useState('');
  const { cashIns, setCashIns } = useFinanceData();

  const addCash = () => {
    if (!cash || isNaN(Number(cash))) return;
    setCashIns([...cashIns, { id: Date.now().toString(), amount: Number(cash), description: desc }]);
    setCash('');
    setDesc('');
  };

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
        {cashIns.map((e: any, i: number) => <li key={e.id || i}>{e.description}: {e.amount}</li>)}
      </ul>
    </Box>
  );
}
