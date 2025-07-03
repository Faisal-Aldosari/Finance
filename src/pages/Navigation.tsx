import { AppBar, Toolbar, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <AppBar position="static" color="default" sx={{ mb: 3 }}>
      <Toolbar sx={{ gap: 2 }}>
        <Button component={Link} to="/" color="inherit">Dashboard</Button>
        <Button component={Link} to="/actuals" color="inherit">Actuals Input</Button>
        <Button component={Link} to="/departments" color="inherit">Department Input</Button>
        <Button component={Link} to="/budget" color="inherit">Budget Input</Button>
        <Button component={Link} to="/cash" color="inherit">Cash In Input</Button>
        <Button component={Link} to="/reports" color="inherit">Reports</Button>
      </Toolbar>
    </AppBar>
  );
}
