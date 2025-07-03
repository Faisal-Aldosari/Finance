import { useState } from 'react';
import { Box, Typography, Paper, Button, Menu, MenuItem, IconButton } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import MapIcon from '@mui/icons-material/Map';
import EditIcon from '@mui/icons-material/Edit';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const sampleData = [
  { name: 'A', value: 12, lat: 24.7136, lng: 46.6753 },
  { name: 'B', value: 19, lat: 21.3891, lng: 39.8579 },
  { name: 'C', value: 7, lat: 25.3548, lng: 51.1839 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface ChartEditorProps {
  type: 'bar' | 'pie' | 'table' | 'map';
  data: { name: string; value: number; lat?: number; lng?: number }[];
  onEdit: (type: 'bar' | 'pie' | 'table' | 'map') => void;
}

function ChartEditor({ type, data, onEdit }: ChartEditorProps) {
  // For demo, just allow type switching
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
        <MenuItem onClick={() => { onEdit('map'); handleClose(); }}><MapIcon sx={{ mr: 1 }} />Map</MenuItem>
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
              {data.map((entry, index) => (
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
      {type === 'map' && (
        <Box sx={{ blockSize: 300, inlineSize: '100%' }}>
          <MapContainer center={[24.7136, 46.6753]} zoom={5} style={{ blockSize: '100%', inlineSize: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {data.map((row: any, idx: number) => (
              <Marker key={idx} position={[row.lat, row.lng]}>
                <Popup>{row.name}: {row.value}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </Box>
      )}
    </Paper>
  );
}

export default function DashboardBuilder() {
  const [visuals, setVisuals] = useState([
    { id: 1, type: 'bar', data: sampleData },
    { id: 2, type: 'pie', data: sampleData },
    { id: 3, type: 'table', data: sampleData },
    { id: 4, type: 'map', data: sampleData },
  ]);

  const handleEdit = (id: number, newType: string) => {
    setVisuals(visuals.map(v => v.id === id ? { ...v, type: newType } : v));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard Builder</Typography>
      {visuals.map(v => (
        <ChartEditor key={v.id} type={v.type} data={v.data} onEdit={type => handleEdit(v.id, type)} />
      ))}
      <Button variant="contained" sx={{ mt: 2 }}>Save Dashboard</Button>
    </Box>
  );
}
