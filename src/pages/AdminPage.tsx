import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, Grid, Divider } from '@mui/material';
import axios from 'axios';
import jsPDF from 'jspdf';

export default function AdminPage() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [agg, setAgg] = useState({});
  const [deptName, setDeptName] = useState('');
  const [empName, setEmpName] = useState('');
  const [empDept, setEmpDept] = useState('');
  const [sessEmp, setSessEmp] = useState('');
  const [sessExpected, setSessExpected] = useState('');
  const [sessActual, setSessActual] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const d = await axios.get('/departments');
    setDepartments(d.data);
    const e = await axios.get('/employees');
    setEmployees(e.data);
    const a = await axios.get('/sessions/aggregate');
    setAgg(a.data);
  };

  const addDepartment = async () => {
    await axios.post('/departments', { id: deptName.toLowerCase(), name: deptName });
    setDeptName('');
    fetchAll();
  };

  const addEmployee = async () => {
    await axios.post('/employees', { id: empName.toLowerCase(), name: empName, department_id: empDept });
    setEmpName('');
    setEmpDept('');
    fetchAll();
  };

  const addSession = async () => {
    await axios.post('/sessions', { id: Date.now().toString(), employee_id: sessEmp, expected: Number(sessExpected), actual: Number(sessActual) });
    setSessEmp('');
    setSessExpected('');
    setSessActual('');
    fetchAll();
  };

  const exportPDF = async () => {
    // Option 1: Download from backend
    window.open('/export/pdf', '_blank');
    // Option 2: Custom frontend PDF (example below)
    // const doc = new jsPDF();
    // doc.text('Departments', 10, 10);
    // departments.forEach((d, i) => doc.text(`${d.id}: ${d.name}`, 10, 20 + i * 10));
    // doc.save('report.pdf');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Panel</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Add Department</Typography>
        <TextField label="Department Name" value={deptName} onChange={e => setDeptName(e.target.value)} size="small" sx={{ mr: 2 }} />
        <Button variant="contained" onClick={addDepartment}>Add</Button>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Add Employee</Typography>
        <TextField label="Employee Name" value={empName} onChange={e => setEmpName(e.target.value)} size="small" sx={{ mr: 2 }} />
        <TextField label="Department ID" value={empDept} onChange={e => setEmpDept(e.target.value)} size="small" sx={{ mr: 2 }} />
        <Button variant="contained" onClick={addEmployee}>Add</Button>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Add Session</Typography>
        <TextField label="Employee ID" value={sessEmp} onChange={e => setSessEmp(e.target.value)} size="small" sx={{ mr: 2 }} />
        <TextField label="Expected" value={sessExpected} onChange={e => setSessExpected(e.target.value)} size="small" sx={{ mr: 2 }} />
        <TextField label="Actual" value={sessActual} onChange={e => setSessActual(e.target.value)} size="small" sx={{ mr: 2 }} />
        <Button variant="contained" onClick={addSession}>Add</Button>
      </Paper>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Departments</Typography>
      <ul>
        {departments.map((d: any) => <li key={d.id}>{d.id}: {d.name}</li>)}
      </ul>
      <Typography variant="h6">Employees</Typography>
      <ul>
        {employees.map((e: any) => <li key={e.id}>{e.id}: {e.name} (Dept: {e.department_id})</li>)}
      </ul>
      <Typography variant="h6">Session Aggregates</Typography>
      <ul>
        {Object.entries(agg).map(([eid, data]: any) => <li key={eid}>Employee {eid}: Expected {data.expected}, Actual {data.actual}</li>)}
      </ul>
      <Button variant="outlined" onClick={exportPDF} sx={{ mt: 2 }}>Export PDF</Button>
    </Box>
  );
}
