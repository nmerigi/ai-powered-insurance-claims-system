import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  Paper,
  Button,
  Avatar,
  IconButton,
  LinearProgress,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  UploadFile, 
  Delete, 
  Person, 
  Notifications,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { auth, db, storage } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Enhanced theme matching the dashboard
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
      default: '#f1f5f9', // Slightly darker background
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b', // Slate Gray
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(30, 58, 138, 0.25)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(30, 58, 138, 0.08)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          height: '12px',
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        },
        bar: {
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        },
      },
    },
  },
});

function SubmitClaim() {
  const [userName, setUserName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const calculateProgress = () => {
    let progress = 0;

    if (formData.fullName.trim()) progress += 20;
    if (formData.email.trim()) progress += 20;
    if (formData.phone.trim()) progress += 20;
    if (formData.address.trim()) progress += 20;
    if (uploadedFiles.length > 0) progress += 20;

    return progress;
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const { fullName, email } = userDoc.data();
          setUserName((fullName || '').split(' ')[0]);
          setFormData(prev => ({
            ...prev,
            fullName,
            email
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file: file,
    }));
    setUploadedFiles([newFiles[0]]);// only one file upload por favor
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;
      if (!user) return alert("You must be logged in.");
      if (uploadedFiles.length === 0) return alert("Please upload a file.");

      const file = uploadedFiles[0];
      const storageRef = ref(storage, `claims/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file.file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      const claimId = `CS-${Date.now().toString().slice(-6)}-${new Date().getFullYear()}`;
      await addDoc(collection(db, 'claims'), {
        userId: user.uid,
        claimId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        fileUrl: downloadUrl,
        createdAt: Timestamp.now(),
        status: 'In Review',
      });

      setSnackbarMessage('Claim submitted successfully!');
      setSnackbarOpen(true);
      setTimeout(() => navigate('/claimant-dashboard'), 2000);
    } catch (err) {
      console.error(err);
      alert("Error submitting claim.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Main container with dashboard-matching background */}
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: `
            linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%),
            linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 30%, #cbd5e1 100%)
          `,
          position: 'relative',
          zIndex: 1,
          backgroundAttachment: 'fixed', 
          backgroundSize: 'cover',
        }}
      >
        {/* Enhanced Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            py: 2, 
            px: 4, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderRadius: 0,
            borderBottom: '1px solid #e2e8f0',
            background:'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            position: 'relative',
            zIndex: 10,
            boxShadow: '0 4px 20px rgba(30, 58, 138, 0.1)',
          }}
        >
          <Box display="flex" alignItems="center">
            <Box 
              width={48} 
              height={48} 
              borderRadius={3} 
              mr={3}
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              }}
            >
              <SecurityIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                SmartClaims
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Submit New Claim
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              onClick={handleMenuOpen}
              sx={{
                minWidth: 'auto',
                p: 1,
                borderRadius: 2,
                color: 'text.primary',
                '&:hover': { backgroundColor: '#f1f5f9' }
              }}
            >
              <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                {userName.charAt(0)}
              </Avatar>
              <ExpandMoreIcon fontSize="small" />
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: { mt: 1, minWidth: 200 }
              }}
            >
              <MenuItem onClick={handleMenuClose}>
                <Person fontSize="small" sx={{ mr: 2 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <SettingsIcon fontSize="small" sx={{ mr: 2 }} />
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Paper>

        {/* Content */}
        <Container maxWidth={false} sx={{ py: 5, maxWidth: '1400px', mx: 'auto' }}>
          <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
            Submit a New Claim
          </Typography>
          <Typography variant="h6" color="text.secondary" mb={4}>
            Fill out the form below to submit your insurance claim.
          </Typography>

          {/* Progress Bar */}
          <Box mb={4}>
            <LinearProgress variant="determinate" value={calculateProgress()} sx={{ borderRadius: 2, height: 12 }} />
          </Box>

          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
              Personal Details
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Please provide your contact information.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Full Name" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleInputChange} 
                  required 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Phone Number" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  required 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Address" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  required 
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
              Upload Claim Documents
            </Typography>

            <Box
              sx={{
                border: '2px dashed #cbd5e1',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: dragActive ? '#eff6ff' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleFiles(e.dataTransfer.files);
              }}
            >
              <UploadFile fontSize="large" sx={{ color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary" mt={1}>
                Drag & drop files here or click to browse
              </Typography>
              <Button variant="contained" component="label" sx={{ mt: 2 }}>
                Choose Files
                <input hidden type="file" onChange={(e) => handleFiles(e.target.files)} accept=".pdf,.jpg,.jpeg,.png" />
              </Button>
              <Typography variant="caption" display="block" mt={1} color="text.secondary">
                Supported: PDF, JPG, PNG (Max 10MB)
              </Typography>
            </Box>

            {/* Uploaded File List */}
            {uploadedFiles.length > 0 && (
              <Box mt={4}>
                <Typography variant="subtitle1" fontWeight={500} color="primary.main" mb={2}>
                  Uploaded Files
                </Typography>
                {uploadedFiles.map(file => (
                  <Paper key={file.id} sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{file.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatFileSize(file.size)}</Typography>
                    </Box>
                    <IconButton color="error" onClick={() => removeFile(file.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>

          <Divider sx={{ my: 4 }} />

          {/* Buttons */}
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button 
              variant="outlined" 
              color="inherit" 
              startIcon={<Person />} 
              onClick={() => navigate('/claimant-dashboard')}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} endIcon={<Person />}>
              Continue
            </Button>
          </Box>
        </Container>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>    
    </ThemeProvider>
  );
}

export default SubmitClaim;