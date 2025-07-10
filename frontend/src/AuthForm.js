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
  Link
} from '@mui/material';

function AuthForm() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('claimant');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ mode, email, password, fullName, role });
  };

  return (
    <Box display="flex" width="100%" height="100vh" sx={{ overflow: 'hidden' }}>
      {/* Left Panel - Hero Section */}
      <Box
        display={{ xs: 'none', lg: 'flex' }}
        width="50%"
         sx={{
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b)', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          p: 4,
          position: 'relative',
        }}
      >
        <Box mb={4}>
          <Box
            width={64}
            height={64}
            bgcolor="rgba(255,255,255,0.2)"
            borderRadius={2}
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={2}
            mx="auto"
          >
            <Box width={32} height={32} bgcolor="linear-gradient(to bottom right, #3b82f6, #7c3aed)" borderRadius={1} />
          </Box>
          <Typography variant="h4" fontWeight="bold" textAlign="center">
            Streamline Your Claims
          </Typography>
          <Typography variant="body1" textAlign="center">
            AI-powered insurance processing for a smarter, faster experience.
          </Typography>
        </Box>
        <Typography variant="caption" position="absolute" bottom={16} left={16}>
          © 2023 ClaimSmart. All rights reserved.
        </Typography>
      </Box>

      {/* Right Panel - Form Section */}
      <Box width={{ xs: '100%', lg: '50%' }} display="flex" alignItems="center" justifyContent="center" p={4} bgcolor="#f1f5f9">
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ borderRadius: 4, p: 4 }}>
            <Box textAlign="center" mb={4}>
              <Typography variant="h5" fontWeight={500} color="text.primary" mb={1}>Welcome to ClaimSmart</Typography>
              <Typography variant="body2" color="text.secondary">{mode === 'login' ? 'Log in to your account.' : 'Create a new account.'}</Typography>
            </Box>

            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(e, newMode) => newMode && setMode(newMode)}
              fullWidth
              sx={{ mb: 3 }}
            >
              <ToggleButton value="login">Login</ToggleButton>
              <ToggleButton value="signup">Signup</ToggleButton>
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
                />
              )}
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
              />
              {mode === 'signup' && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    label="Role"
                    required
                  >
                    <MenuItem value="claimant">Claimant</MenuItem>
                    <MenuItem value="insurer">Insurer</MenuItem>
                  </Select>
                </FormControl>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                 sx={{
                      mt: 3,
                      py: 1.5,
                      backgroundColor: '#2563eb', 
                      '&:hover': {
                        backgroundColor: '#1d4ed8',
                      },
                    }}
              >
                {mode === 'login' ? 'Login' : 'Create Account'}
              </Button>
            </form>

            {mode === 'login' && (
              <Box textAlign="center" mt={2}>
                <Link href="#" variant="body2">Forgot Password?</Link>
              </Box>
            )}

            <Box textAlign="center" mt={4}>
              <Typography variant="caption">
                By continuing, you agree to our <Link href="#">Terms of Service</Link> and <Link href="#">Privacy Policy</Link>.
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default AuthForm;