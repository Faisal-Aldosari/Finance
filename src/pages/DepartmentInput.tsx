import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import { useFinanceData } from '../context/FinanceDataContext';

export default function DepartmentInput() {
  const [department, setDepartment] = useState('');
  const { departments, setDepartments } = useFinanceData();

  const addDepartment = () => {
    if (!department.trim()) return;
    setDepartments([...departments, { id: Date.now().toString(), name: department }]);
    setDepartment('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Department Input</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField label="Department Name" value={department} onChange={e => setDepartment(e.target.value)} size="small" sx={{ mr: 2 }} />
        <Button variant="contained" onClick={addDepartment}>Add</Button>
      </Paper>
      <Typography variant="h6">Departments</Typography>
      <ul>
        {departments.map((d, i) => <li key={d.id || i}>{d.name}</li>)}
      </ul>
    </Box>
  );
}
