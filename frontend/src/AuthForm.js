// Firebase services
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getDoc } from 'firebase/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase'; 
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Link,
  Avatar,
  Divider
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

// Global styles to remove white gaps and scrolling
const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  
  #root {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
`;

// Inject global styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}

// Custom theme with our color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // Primary Navy
      light: '#3b82f6', // Light Blue
      dark: '#1e293b', // Darker navy
    },
    secondary: {
      main: '#2563eb', // Professional Blue
      light: '#60a5fa',
    },
    success: {
      main: '#10b981', // Emerald Green
    },
    background: {
      default: '#f1f5f9', // Light Gray
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b', // Slate Gray
    }
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3b82f6',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1e3a8a',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(30, 58, 138, 0.3)',
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 500,
          border: '2px solid #e2e8f0',
          '&.Mui-selected': {
          backgroundColor: '#2563eb',
          color: 'white',
          border: '2px solid #2563eb',
          '&:hover': {
            backgroundColor: '#1e3a8a',
          },
        },
        },
      },
    },
  },
});

function AuthForm() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('claimant');

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const navigate = useNavigate();

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Signup successful:', user);

        await setDoc(doc(db, 'users', user.uid), {
          fullName,
          email,
          role,
          createdAt: new Date()
        });

        showSnackbar('Account created successfully!');
        setMode('login');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Login successful:', user);

        // Get user's role from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.role;

          showSnackbar('Welcome back!');

          // Navigate to correct dashboard
          if (userRole === 'claimant') {
            navigate('/claimant-dashboard');
          } else if (userRole === 'insurer') {
            navigate('/insurer-dashboard');
          } else {
            showSnackbar('Unknown role assigned. Please contact support.', 'error');
          }
        } else {
          showSnackbar('User role not found. Contact admin.', 'error');
        }
      }

      setEmail('');
      setPassword('');
      setFullName('');
      setRole('claimant');

    } catch (error) {
      console.error('Firebase Auth Error:', error.message);
      if (error.code === 'auth/user-not-found') {
        showSnackbar('No account found with that email.', 'error');
      } else if (error.code === 'auth/wrong-password') {
        showSnackbar('Incorrect password. Please try again.', 'error');
      } else if (error.code === 'auth/email-already-in-use') {
        showSnackbar('This email is already in use. Please log in instead.', 'error');
      } else if (error.code === 'auth/invalid-email') {
        showSnackbar('Please enter a valid email address.', 'error');
      } else if (error.code === 'auth/weak-password') {
        showSnackbar('Password should be at least 6 characters.', 'error');
      } else {
        showSnackbar(error.message, 'error');
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        display="flex" 
        width="100vw" 
        height="100vh" 
        sx={{ 
          overflow: 'hidden',
          margin: 0,
          padding: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        {/* Left Panel - Hero Section */}
        <Box
          display={{ xs: 'none', lg: 'flex' }}
          width="50%"
          sx={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            p: 6,
            position: 'relative',
          }}
        >
          <Box mb={6} sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              width={80}
              height={80}
              borderRadius={3}
              display="flex"
              justifyContent="center"
              alignItems="center"
              mb={3}
              mx="auto"
              sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
            <SecurityIcon sx={{ fontSize: 40, color: '#10b981' }} />
            </Box>
            
            <Typography variant="h3" fontWeight="bold" textAlign="center" mb={2}>
              SmartClaims Insurance
            </Typography>
            <Typography variant="h6" textAlign="center" sx={{ opacity: 0.9, mb: 4 }}>
              AI-powered claims processing for a smarter, faster experience
            </Typography>

            {/* Feature highlights */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SmartToyIcon sx={{ color: '#10b981' }} />
                <Typography variant="body1">Automated claim processing</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <VerifiedUserIcon sx={{ color: '#10b981' }} />
                <Typography variant="body1">Secure & trusted platform</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SecurityIcon sx={{ color: '#10b981' }} />
                <Typography variant="body1">Real-time claim tracking</Typography>
              </Box>
            </Box>
          </Box>
          
          <Typography 
            variant="body2" 
            position="absolute" 
            bottom={24} 
            left={24}
            sx={{ opacity: 0.7 }}
          >
            © 2024 SmartClaims Insurance. All rights reserved.
          </Typography>
        </Box>

        {/* Right Panel - Form Section */}
        <Box 
          width={{ xs: '100%', lg: '50%' }} 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          p={4} 
          sx={{ 
            backgroundColor: '#f8fafc',
            height: '100vh',
            overflow: 'auto'
          }}
        >
          <Container maxWidth="sm">
            <Paper 
              elevation={0}
              sx={{ 
                borderRadius: 4, 
                p: 5,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 40px rgba(30, 58, 138, 0.1)',
              }}
            >
              <Box textAlign="center" mb={4}>
                <Typography variant="h4" fontWeight={600} color="#2563eb" mb={1}>
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {mode === 'login' 
                    ? 'Sign in to access your insurance dashboard' 
                    : 'Create your account to get started'
                  }
                </Typography>
              </Box>

              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(e, newMode) => newMode && setMode(newMode)}
                fullWidth
                sx={{ 
                  mb: 4,
                  '& .MuiToggleButtonGroup-grouped': {
                    border: 'none',
                    margin: '0 2px',
                    '&:first-of-type': {
                      marginLeft: 0,
                    },
                    '&:last-of-type': {
                      marginRight: 0,
                    },
                  },
                }}
              >
                <ToggleButton value="login">Sign In</ToggleButton>
                <ToggleButton value="signup">Create Account</ToggleButton>
              </ToggleButtonGroup>

              <form onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <TextField
                    label="Full Name"
                    fullWidth
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    margin="normal"
                    required
                    sx={{ mb: 2 }}
                  />
                )}
                
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  sx={{ mb: 2 }}
                />
                
                {mode === 'signup' && (
                  <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
                    <InputLabel>Account Type</InputLabel>
                    <Select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      label="Account Type"
                      required
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value="claimant">Claimant</MenuItem>
                      <MenuItem value="insurer">Insurance Provider</MenuItem>
                    </Select>
                  </FormControl>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.8,
                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    fontSize: '1.1rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                    },
                  }}
                >
                  {mode === 'login' ? 'Sign In' : 'Create My Account'}
                </Button>
              </form>

              {mode === 'login' && (
                <>
                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Need help?
                    </Typography>
                  </Divider>
                  <Box textAlign="center">
                    <Link 
                      href="#" 
                      variant="body2" 
                      sx={{ 
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Forgot your password?
                    </Link>
                  </Box>
                </>
              )}

              <Box textAlign="center" mt={4}>
                <Typography variant="caption" color="text.secondary">
                  By continuing, you agree to our{' '}
                  <Link href="#" sx={{ color: 'primary.main' }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="#" sx={{ color: 'primary.main' }}>Privacy Policy</Link>
                </Typography>
              </Box>
            </Paper>
          </Container>
        </Box>

        {/* Enhanced Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <MuiAlert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            elevation={6}
            variant="filled"
            sx={{
              width: '100%',
              borderRadius: '12px',
              fontWeight: 500,
              ...(snackbarSeverity === 'success' && {
                backgroundColor: '#10b981',
              }),
              ...(snackbarSeverity === 'error' && {
                backgroundColor: '#ef4444',
              }),
            }}
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default AuthForm;