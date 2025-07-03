import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';

export default function DepartmentInput() {
  const [department, setDepartment] = useState('');

  const addDepartment = () => {
    if (!department.trim()) return;
    // For now, just show the functionality - this could be extended to store departments
    alert(`Department "${department}" would be added`);
    setDepartment('');
  };

  // Show some sample departments or existing data
  const sampleDepartments = [
    { id: '1', name: 'Finance' },
    { id: '2', name: 'Operations' },
    { id: '3', name: 'Marketing' },
    { id: '4', name: 'HR' }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Department Input</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField label="Department Name" value={department} onChange={e => setDepartment(e.target.value)} size="small" sx={{ mr: 2 }} />
        <Button variant="contained" onClick={addDepartment}>Add</Button>
      </Paper>
      <Typography variant="h6">Departments</Typography>
      <ul>
        {sampleDepartments.map((d, i) => <li key={d.id || i}>{d.name}</li>)}
      </ul>
    </Box>
  );
}
