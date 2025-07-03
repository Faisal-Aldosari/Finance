import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import { useFinanceData } from '../context/FinanceDataContext';

export default function ActualsInput() {
  const [actual, setActual] = useState('');
  const [desc, setDesc] = useState('');
  const { actuals, setActuals } = useFinanceData();

  const addActual = () => {
    if (!actual || isNaN(Number(actual))) return;
    setActuals([...actuals, { id: Date.now().toString(), departmentId: '', amount: Number(actual), description: desc }]);
    setActual('');
    setDesc('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Actuals Input</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField label="Actual Amount" value={actual} onChange={e => setActual(e.target.value)} size="small" sx={{ mr: 2 }} />
        <TextField label="Description" value={desc} onChange={e => setDesc(e.target.value)} size="small" sx={{ mr: 2 }} />
        <Button variant="contained" onClick={addActual}>Add</Button>
      </Paper>
      <Typography variant="h6">Entries</Typography>
      <ul>
        {actuals.map((e, i) => <li key={e.id || i}>{e.description}: {e.amount}</li>)}
      </ul>
    </Box>
  );
}
