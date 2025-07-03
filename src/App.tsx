import { useState } from 'react'
import { Container, Typography, Box } from '@mui/material'
import AdminPage from './pages/AdminPage'
import DataUploadPage from './pages/DataUploadPage'
import DashboardBuilder from './pages/DashboardBuilder'
import AuthPopup from './pages/AuthPopup'
import CashTracker from './pages/CashTracker'
import './App.css'

function App() {
  const [authOpen, setAuthOpen] = useState(true)
  const [user, setUser] = useState(null)

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
      <AuthPopup open={authOpen} onClose={() => setAuthOpen(false)} onAuth={setUser} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Power BI Clone
        </Typography>
        {user && <Typography variant="subtitle1" align="center">Welcome, {user.username}</Typography>}
        {user && <CashTracker user={user} />}
        <DataUploadPage />
        <AdminPage />
        <DashboardBuilder />
      </Box>
      <Box component="footer" sx={{ textAlign: 'center', py: 2, mt: 4, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="textSecondary">
          Created by Faisal Aldosari
        </Typography>
      </Box>
    </Container>
  )
}

export default App
