import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button } from '@mui/material';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const verifyEmail = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/auth/verify?token=${token}`, {
          method: 'GET',
        });
        
        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
        } else {
          const data = await response.json();
          setStatus('error');
          setMessage(data.detail || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error occurred');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minBlockSize: '100vh',
      gap: 2,
      p: 3
    }}>
      <Typography variant="h4" gutterBottom>Email Verification</Typography>
      
      {status === 'loading' && (
        <>
          <CircularProgress />
          <Typography>Verifying your email...</Typography>
        </>
      )}
      
      {status === 'success' && (
        <>
          <Typography color="success.main" variant="h6">{message}</Typography>
          <Button variant="contained" onClick={handleGoHome}>
            Go to Login
          </Button>
        </>
      )}
      
      {status === 'error' && (
        <>
          <Typography color="error" variant="h6">{message}</Typography>
          <Button variant="outlined" onClick={handleGoHome}>
            Back to Home
          </Button>
        </>
      )}
      
      <Box component="footer" sx={{ textAlign: 'center', py: 2, mt: 4 }}>
        <Typography variant="body2" color="textSecondary">
          Created by Faisal Aldosari
        </Typography>
      </Box>
    </Box>
  );
}
