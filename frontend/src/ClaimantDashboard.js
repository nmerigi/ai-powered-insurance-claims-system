import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { getDoc, doc, collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Avatar,
  Button,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import { 
  Notifications as NotificationsIcon, 
  Add as AddIcon, 
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { FileCopy, HourglassEmpty, CheckCircle, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Enhanced theme with richer colors and gradients
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
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
  },
});

function ClaimantDashboard() {
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState([]);
  const [userName, setUserName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  
  const navigate = useNavigate();

  // Helper function to get customer-facing status
  const getCustomerStatus = (actualStatus) => {
    if (actualStatus === 'Flagged') {
      return 'In Review';
    }
    return actualStatus;
  };

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
    const fetchDashboardData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Fetch user info
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserName((userSnap.data().fullName || '').split(' ')[0]);
        }

        // Fetch claims
        const querySnapshot = await getDocs(collection(db, 'claims'));
        const claimsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })).filter(claim => claim.userId === user.uid); 
        
        // Transform claims to show customer-facing status
        const transformedClaims = claimsData.map(claim => ({
          ...claim,
          displayStatus: getCustomerStatus(claim.status)
        }));
        
        setClaims(transformedClaims);

        const total = claimsData.length;
        const inProgress = claimsData.filter(c => c.status === 'In Review' || c.status === 'Flagged').length;
        const approved = claimsData.filter(c => c.status === 'Approved').length;
        const rejected = claimsData.filter(c => c.status === 'Rejected').length;

        setStats([
          {
            title: 'Total Claims',
            value: total,
            description: 'Claims submitted since joining',
            icon: <FileCopy sx={{ color: '#2563eb' }} fontSize="small" />,
            bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
            iconBg: 'rgba(37, 99, 235, 0.1)',
          },
          {
            title: 'In Progress',
            value: inProgress,
            description: 'Currently under review',
            icon: <HourglassEmpty sx={{ color: '#f59e0b' }} fontSize="small" />,
            bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
            iconBg: 'rgba(245, 158, 11, 0.1)',
          },
          {
            title: 'Approved',
            value: approved,
            description: 'Successfully processed',
            icon: <CheckCircle sx={{ color: '#10b981' }} fontSize="small" />,
            bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)',
            iconBg: 'rgba(16, 185, 129, 0.1)',
          },
          {
            title: 'Rejected',
            value: rejected,
            description: 'Could not be approved',
            icon: <Cancel sx={{ color: '#ef4444' }} fontSize="small" />,
            bgGradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%)',
            iconBg: 'rgba(239, 68, 68, 0.1)',
          },
        ]);
      } catch (error) {
        console.error('Error fetching claim stats:', error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      {/* Main container */}
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
          backgroundSize: 'cover', // Prevents repetition
          '&::before': {
            display: 'none' 
          }
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
                Claimant Dashboard
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
                <PersonIcon fontSize="small" sx={{ mr: 2 }} />
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

        {/* Scrollable content container */}
        <Box sx={{ position: 'relative', zIndex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 64px)' }}>
          <Container maxWidth="xl" sx={{ py: 5 }}>
            {/* Welcome Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
              <Box>
                <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>
                  Welcome back{userName ? `, ${userName}` : ''}! 
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Track your claims and submit new ones with ease
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<AddIcon />} 
                onClick={() => navigate('/submit-claim')}
                sx={{ px: 4, py: 1.5 }}
              >
                Submit New Claim
              </Button>
            </Box>

            {/* Enhanced Hero Banner with richer gradient */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 5, 
                mb: 5, 
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translate(50px, -50px)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  transform: 'translate(-50px, 50px)',
                }
              }}
            >
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" fontWeight={700} color="white" gutterBottom> 
                    Simplify Your Claims Process
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)' }} mb={3}>
                    Submit new claims effortlessly with our AI-powered system and track their progress in real-time with complete transparency.
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<AddIcon />} 
                    onClick={() => navigate('/submit-claim')}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      }
                    }}
                  >
                    Get Started
                  </Button>
                </Grid>
                <Grid item md={4} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                  <Box 
                    width={140} 
                    height={140} 
                    borderRadius="50%" 
                    sx={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <SecurityIcon sx={{ fontSize: 60, color: 'white' }} />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Enhanced Stats Cards - Wider with better spacing */}
            <Grid container spacing={2} mb={5}>
              {stats.map((stat, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}
                  sx={{
                    flex: '1 0 auto', // Makes cards grow to fill available space
                    minWidth: '250px', // Set minimum width to prevent getting too small
                    maxWidth: '100%' // Prevent overflow
                  }}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 4, 
                      height: '100%',
                      background: stat.bgGradient,
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(30, 58, 138, 0.2)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.3)',
                        transform: 'translate(30px, -30px)',
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                      <Box 
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: stat.iconBg,
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Typography variant="h3" fontWeight={800} color="primary.main">
                        {stat.value}
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="text.primary" mb={1}>
                      {stat.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {stat.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Claims Table  */}
            <Paper elevation={0} sx={{ overflow: 'hidden' }}>
              <Box 
                px={4} 
                py={3} 
                borderBottom={1} 
                borderColor="divider" 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                sx={{ 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                }}
              >
                <Box>
                  <Typography variant="h5" fontWeight={600} color="primary.main">
                    Recent Claims
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track the status of your submitted claims
                  </Typography>
                </Box>
                
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(30, 58, 138, 0.05)' }}>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Claim ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Date Filed</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {claims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                          <Box>
                            <FileCopy sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" mb={1}>
                              No claims found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Submit your first claim to get started
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      claims.map((claim, index) => (
                        <TableRow
                          key={index}
                          hover
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(30, 58, 138, 0.03)',
                              transform: 'scale(1.01)',
                            },
                          }}
                          onClick={() => navigate(`/claim-details/${claim.id}`)} 
                        >
                          <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {claim.claimId}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>Outpatient Visit</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {claim.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={claim.displayStatus}
                              color={
                                claim.displayStatus === 'Approved' ? 'success' :
                                claim.displayStatus === 'Rejected' ? 'error' :
                                'info'
                              }
                              variant="outlined"
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {claim.ocrData?.['Claimed Amount'] ? `Ksh ${claim.ocrData['Claimed Amount']}` : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default ClaimantDashboard;