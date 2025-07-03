import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Tabs, Tab, Box, TextField, Button, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';

interface AuthPopupProps {
  open: boolean;
  onClose: () => void;
  onAuth: (user: { username: string }) => void;
}

export default function AuthPopup({ open, onAuth }: Omit<AuthPopupProps, 'onClose'>) {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const handleTab = (_: any, v: number) => setTab(v);

  const handleEmailAuth = async (type: 'login' | 'register') => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || (type === 'register' && !username)) {
      setError('Please fill all fields');
      return;
    }
    setError('');
    if (type === 'register') {
      // Call backend to register and send verification email
      try {
        // Replace with real API call
        await fetch('/auth/request-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password })
        });
        setVerificationSent(true);
        setPendingEmail(email);
      } catch {
        setError('Failed to send verification email.');
      }
    } else {
      // Login flow (should check verification status)
      onAuth({ username: username || email });
    }
  };

  const handleSocial = (provider: 'google' | 'microsoft') => {
    // TODO: Redirect to backend OAuth endpoint
    window.open(`/auth/${provider}`, '_self');
  };

  return (
    <Dialog open={open} onClose={undefined} disableEscapeKeyDown>
      <DialogTitle>Sign In / Register</DialogTitle>
      <DialogContent>
        {verificationSent ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minInlineSize: 300 }}>
            <Typography>A verification email has been sent to {pendingEmail}. Please verify your email to continue.</Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>Reload</Button>
          </Box>
        ) : (
          <>
            <Tabs value={tab} onChange={handleTab} sx={{ mb: 2 }}>
              <Tab label="Email" />
              <Tab label="Social" />
            </Tabs>
            {tab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minInlineSize: 300 }}>
                <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} />
                {error && <Typography color="error">{error}</Typography>}
                <Button variant="contained" onClick={() => handleEmailAuth('login')}>Login</Button>
                <Button variant="outlined" onClick={() => handleEmailAuth('register')}>Register</Button>
              </Box>
            )}
            {tab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minInlineSize: 300 }}>
                <Button variant="contained" startIcon={<GoogleIcon />} onClick={() => handleSocial('google')}>Sign in with Google</Button>
                <Button variant="contained" startIcon={<MicrosoftIcon />} onClick={() => handleSocial('microsoft')}>Sign in with Microsoft</Button>
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
