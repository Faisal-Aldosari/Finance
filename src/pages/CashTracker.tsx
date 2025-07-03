import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Grid } from '@mui/material';
import axios from 'axios';

interface CashTrackerProps {
  user: { username: string };
}

export default function CashTracker({ user }: CashTrackerProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('in');
  const [desc, setDesc] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    try {
      const res = await axios.get('/cash/summary', { withCredentials: true });
      setSummary(res.data);
    } catch (e) {
      setError('Failed to fetch summary');
    }
  };

  useEffect(() => {
    if (user) fetchSummary();
  }, [user]);

  const addTransaction = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Enter a valid positive amount');
      return;
    }
    if (type !== 'in' && type !== 'out') {
      setError('Type must be "in" or "out"');
      return;
    }
    if (!desc.trim()) {
      setError('Description is required');
      return;
    }
    setError('');
    try {
      await axios.post('/cash/transaction', {
        id: Date.now().toString(),
        type,
        amount: Number(amount),
        description: desc
      }, { withCredentials: true });
      setAmount('');
      setDesc('');
      fetchSummary();
    } catch (e) {
      setError('Failed to add transaction. Please try again.');
    }
  };

  const exportPDF = () => {
    window.open('/cash/summary/pdf', '_blank');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Cash Tracker</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={3}>
            <TextField label="Amount" value={amount} onChange={e => setAmount(e.target.value)} size="small" />
          </Grid>
          <Grid item xs={3}>
            <TextField label="Type" value={type} onChange={e => setType(e.target.value)} size="small" helperText="in or out" />
          </Grid>
          <Grid item xs={4}>
            <TextField label="Description" value={desc} onChange={e => setDesc(e.target.value)} size="small" />
          </Grid>
          <Grid item xs={2}>
            <Button variant="contained" onClick={addTransaction}>Add</Button>
          </Grid>
        </Grid>
        {error && <Typography color="error">{error}</Typography>}
      </Paper>
      {summary && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">Summary Cards</Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}><Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>Total In: {summary.total_in}</Paper></Grid>
            <Grid item xs={4}><Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>Total Out: {summary.total_out}</Paper></Grid>
            <Grid item xs={4}><Paper sx={{ p: 2, bgcolor: '#fffde7' }}>Total Cash: {summary.total_cash}</Paper></Grid>
            <Grid item xs={6}><Paper sx={{ p: 2, bgcolor: '#f3e5f5' }}>Gross Margin: {summary.gross_margin}</Paper></Grid>
            <Grid item xs={6}><Paper sx={{ p: 2, bgcolor: '#fbe9e7' }}>Net: {summary.net}</Paper></Grid>
          </Grid>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={exportPDF}>Export Summary PDF</Button>
        </Paper>
      )}
    </Box>
  );
}
