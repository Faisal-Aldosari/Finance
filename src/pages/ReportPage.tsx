import { useState } from 'react';
import { Box, Typography, Paper, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useFinanceData } from '../context/FinanceDataContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ReportPage() {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'table'>('bar');
  const { getAnalytics } = useFinanceData();
  const summary = getAnalytics([]);
  const data = [
    { name: 'Net Profit', value: summary.netProfit },
    { name: 'Total Income', value: summary.totalIncome },
    { name: 'Gross Margin', value: summary.grossMargin },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Financial Report</Typography>
      <FormControl sx={{ mb: 2, blockSize: 56, inlineSize: 200 }}>
        <InputLabel id="chart-type-label">Chart Type</InputLabel>
        <Select
          labelId="chart-type-label"
          value={chartType}
          label="Chart Type"
          onChange={e => setChartType(e.target.value as 'bar' | 'pie' | 'table')}
        >
          <MenuItem value="bar">Bar Chart</MenuItem>
          <MenuItem value="pie">Pie Chart</MenuItem>
          <MenuItem value="table">Table</MenuItem>
        </Select>
      </FormControl>
      <Paper sx={{ p: 2, mb: 2 }}>
        {chartType === 'bar' && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        )}
        {chartType === 'pie' && (
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
        {chartType === 'table' && (
          <Box>
            <table style={{ inlineSize: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
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
    </Box>
  );
}
