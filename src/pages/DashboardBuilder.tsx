import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Menu, MenuItem, IconButton, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import EditIcon from '@mui/icons-material/Edit';
import { useFinanceData } from '../context/FinanceDataContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface ChartEditorProps {
  type: 'bar' | 'pie' | 'table';
  data: { name: string; value: number }[];
  onEdit: (type: 'bar' | 'pie' | 'table') => void;
}

function ChartEditor({ type, data, onEdit }: ChartEditorProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenu = (e: any) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  return (
    <Paper sx={{ p: 2, mb: 2, position: 'relative' }}>
      <IconButton onClick={handleMenu} sx={{ position: 'absolute', insetBlockStart: 8, insetInlineEnd: 8 }}><EditIcon /></IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => { onEdit('bar'); handleClose(); }}><BarChartIcon sx={{ mr: 1 }} />Bar Chart</MenuItem>
        <MenuItem onClick={() => { onEdit('pie'); handleClose(); }}><PieChartIcon sx={{ mr: 1 }} />Pie Chart</MenuItem>
        <MenuItem onClick={() => { onEdit('table'); handleClose(); }}><TableChartIcon sx={{ mr: 1 }} />Table</MenuItem>
      </Menu>
      {type === 'bar' && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      )}
      {type === 'pie' && (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
      {type === 'table' && (
        <Box>
          <table style={{ inlineSize: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #ccc', padding: 4 }}>{row.name}</td>
                  <td style={{ border: '1px solid #ccc', padding: 4 }}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}
    </Paper>
  );
}

export default function DashboardBuilder() {
  const { getAnalytics } = useFinanceData();
  const summary = getAnalytics([]);
  const [visuals, setVisuals] = useState<{
    id: number;
    type: 'bar' | 'pie' | 'table';
    data: { name: string; value: number }[];
  }[]>([
    { id: 1, type: 'bar', data: [
      { name: 'Net Profit', value: summary.netProfit },
      { name: 'Total Income', value: summary.totalIncome },
      { name: 'Gross Margin', value: summary.grossMargin },
    ] },
    { id: 2, type: 'pie', data: [
      { name: 'Net Profit', value: summary.netProfit },
      { name: 'Total Income', value: summary.totalIncome },
      { name: 'Gross Margin', value: summary.grossMargin },
    ] },
    { id: 3, type: 'table', data: [
      { name: 'Net Profit', value: summary.netProfit },
      { name: 'Total Income', value: summary.totalIncome },
      { name: 'Gross Margin', value: summary.grossMargin },
    ] },
  ]);

  const handleEdit = (id: number, newType: 'bar' | 'pie' | 'table') => {
    setVisuals(visuals.map(v => v.id === id ? { ...v, type: newType } : v));
  };

  // Update visuals when summary changes
  useEffect(() => {
    setVisuals(visuals => visuals.map(v => ({ ...v, data: [
      { name: 'Net Profit', value: summary.netProfit },
      { name: 'Total Income', value: summary.totalIncome },
      { name: 'Gross Margin', value: summary.grossMargin },
    ] })));
  }, [summary]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={4}><Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>Net Profit: {summary.netProfit}</Paper></Grid>
        <Grid item xs={4}><Paper sx={{ p: 2, bgcolor: '#f3e5f5' }}>Total Income: {summary.totalIncome}</Paper></Grid>
        <Grid item xs={4}><Paper sx={{ p: 2, bgcolor: '#fffde7' }}>Gross Margin: {summary.grossMargin}</Paper></Grid>
      </Grid>
      {visuals.map(v => (
        <ChartEditor key={v.id} type={v.type} data={v.data} onEdit={type => handleEdit(v.id, type)} />
      ))}
      <Button variant="contained" sx={{ mt: 2 }}>Save Dashboard</Button>
    </Box>
  );
}
