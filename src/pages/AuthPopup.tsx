import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Tabs, Tab, Box, TextField, Button, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';

interface AuthPopupProps {
  open: boolean;
  onAuth: (user: { username: string }) => void;
}

export default function AuthPopup({ open, onAuth }: AuthPopupProps) {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  // Check for OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      // OAuth success - extract user info or authenticate
      onAuth({ username: 'OAuth User' });
      // Clear URL parameters
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [onAuth]);
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
    
    const apiUrl = import.meta.env.VITE_API_URL || '';
    
    if (type === 'register') {
      // Call backend to register and send verification email
      try {
        const response = await fetch(`${apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, username })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Registration successful, show success message and switch to login
          setError('');
          alert('Registration successful! You can now login with your username or email.');
          setTab(0); // Switch to login tab
        } else {
          setError(data.detail || 'Registration failed');
        }
      } catch (err) {
        console.error('Registration error:', err);
        setError('Failed to register. Please try again.');
      }
    } else {
      // Login flow - support both username and email
      try {
        const response = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Store the token if needed
          if (data.access_token) {
            localStorage.setItem('auth_token', data.access_token);
          }
          onAuth({ username: data.user?.username || data.user?.email || email });
          setError('');
        } else {
          setError(data.detail || 'Invalid credentials');
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleSocial = (provider: 'google' | 'microsoft') => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    window.location.href = `${apiUrl}/auth/${provider}/authorize`;
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
                <TextField 
                  label="Email or Username" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  helperText="You can use your email or username to login"
                />
                <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <TextField 
                  label="Username (for registration)" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)}
                  helperText="Only required for registration"
                />
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
