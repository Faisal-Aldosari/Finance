import { useState } from 'react';
import { Box, Typography, Button, Paper, Input, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axios from 'axios';

export default function DataUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
    const allowedTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only CSV or Excel files are allowed.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      const resUpload = await axios.post('/upload-data', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (!resUpload.data || !resUpload.data.columns || resUpload.data.rows === 0) {
        alert('Uploaded file contains no data. Please check your file.');
        return;
      }
      const res = await axios.get('/uploaded-data');
      if (res.data.length > 0) {
        setColumns(Object.keys(res.data[0]));
        setRows(res.data);
      } else {
        alert('Uploaded file contains no data. Please check your file.');
      }
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Failed to upload or parse file. Please ensure it is a valid CSV or Excel file.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Data Upload</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Input type="file" onChange={handleFileChange} />
        <Button variant="contained" onClick={handleUpload} sx={{ ml: 2 }}>Upload</Button>
      </Paper>
      {rows.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map(col => <TableCell key={col}>{col}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map(col => <TableCell key={col}>{row[col]}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
