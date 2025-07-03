import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Tabs, Tab, Box, TextField, Button, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';

export default function AuthPopup({ open, onClose, onAuth }: any) {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleTab = (_: any, v: number) => setTab(v);

  const handleEmailAuth = async (type: 'login' | 'register') => {
    // TODO: Call backend for login/register
    if (!email || !password || (type === 'register' && !username)) {
      setError('Please fill all fields');
      return;
    }
    setError('');
    // Simulate success
    onAuth({ username: username || email });
    onClose();
  };

  const handleSocial = (provider: 'google' | 'microsoft') => {
    // TODO: Redirect to backend OAuth endpoint
    window.open(`/auth/${provider}`, '_self');
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Sign In / Register</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={handleTab} sx={{ mb: 2 }}>
          <Tab label="Email" />
          <Tab label="Social" />
        </Tabs>
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} />
            {error && <Typography color="error">{error}</Typography>}
            <Button variant="contained" onClick={() => handleEmailAuth('login')}>Login</Button>
            <Button variant="outlined" onClick={() => handleEmailAuth('register')}>Register</Button>
          </Box>
        )}
        {tab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
            <Button variant="contained" startIcon={<GoogleIcon />} onClick={() => handleSocial('google')}>Sign in with Google</Button>
            <Button variant="contained" startIcon={<MicrosoftIcon />} onClick={() => handleSocial('microsoft')}>Sign in with Microsoft</Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
