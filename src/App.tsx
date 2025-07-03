import { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './pages/Navigation';
import AuthPopup from './pages/AuthPopup';
import ActualsInput from './pages/ActualsInput';
import DepartmentInput from './pages/DepartmentInput';
import BudgetInput from './pages/BudgetInput';
import CashInInput from './pages/CashInInput';
import ReportPage from './pages/ReportPage';
import DashboardBuilder from './pages/DashboardBuilder';
import VerifyEmail from './pages/VerifyEmail';
import FinanceDashboard from './pages/FinanceDashboard';
import { FinanceDataProvider } from './context/FinanceDataContext';
import './App.css';

function Dashboard() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [authOpen, setAuthOpen] = useState(!user);
  
  const handleAuth = (user: { username: string }) => {
    setUser(user);
    setAuthOpen(false);
  };
  
  return (
    <>
      <AuthPopup open={authOpen} onAuth={handleAuth} />
      <Typography variant="h3" align="center" gutterBottom>
        YoussefBI
      </Typography>
      {user && <Typography variant="subtitle1" align="center">Welcome, {user?.username}</Typography>}
      <DashboardBuilder />
    </>
  );
}

function App() {
  return (
    <FinanceDataProvider>
      <Router>
        <Container maxWidth="md" sx={{ blockSize: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
          <Navigation />
          <Box sx={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/finance" element={<FinanceDashboard />} />
              <Route path="/actuals" element={<ActualsInput />} />
              <Route path="/departments" element={<DepartmentInput />} />
              <Route path="/budget" element={<BudgetInput />} />
              <Route path="/cash" element={<CashInInput />} />
              <Route path="/reports" element={<ReportPage />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Routes>
          </Box>
          <Box component="footer" sx={{ textAlign: 'center', py: 2, mt: 4, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Created by Faisal Aldosari
            </Typography>
          </Box>
        </Container>
      </Router>
    </FinanceDataProvider>
  );
}

export default App;
