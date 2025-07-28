import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Paper, Grid, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, CircularProgress, Divider,
  Menu, MenuItem, Avatar, IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  BarChart as BarChartIcon,
  Lightbulb as LightbulbIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationsIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db,auth } from './firebase';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Enhanced theme matching the claimant dashboard
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

const InsurerDashboard = () => {
  const [userName, setUserName] = useState('');
  const [claims, setClaims] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [chartType, setChartType] = useState('pie'); // 'pie' or 'bar'
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchClaims = async () => {
      try {

        // Fetch user info
        const user = auth.currentUser ;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserName((userSnap.data().fullName || '').split(' ')[0]);
                }

        const querySnapshot = await getDocs(collection(db, 'claims'));
        const claimsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClaims(claimsData);
      } catch (error) {
        console.error('Error fetching claims:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (status) => {
    setFilterAnchorEl(null);
    if (status !== undefined) setStatusFilter(status);
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch =
      claim.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claimId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || claim.status === statusFilter || claim.classification === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Function to get chip color and style based on status
  const getChipProps = (status) => {
    switch (status) {
      case 'Approved':
        return { color: 'success', variant: 'outlined' };
      case 'Rejected':
        return { color: 'error', variant: 'outlined' };
      case 'Flagged':
        return {
          sx: {
            backgroundColor: '#fffde7',
            color: '#ff8f00',
            border: '1px solid #ff8f00'
          },
          variant: 'outlined'
        };
      default:
        return { color: 'info', variant: 'outlined' };
    }
  };

  const totalClaims = claims.length;
  const newClaims = claims.filter((claim) => claim.status === 'In Review').length;
  const approvedClaims = claims.filter((claim) => claim.status === 'Approved').length;
  const rejectedClaims = claims.filter((claim) => claim.status === 'Rejected').length;
  const flaggedClaims = claims.filter((claim) => claim.status === 'Flagged' || claim.classification === 'Flagged').length;

  // Chart data
  const pieData = [
    { name: 'In Review', value: newClaims, color: '#3b82f6' },
    { name: 'Approved', value: approvedClaims, color: '#10b981' },
    { name: 'Rejected', value: rejectedClaims, color: '#ef4444' },
    { name: 'Flagged', value: flaggedClaims, color: '#f59e0b' },
  ];

  const barData = [
    { name: 'In Review', count: newClaims, fill: '#3b82f6' },
    { name: 'Approved', count: approvedClaims, fill: '#10b981' },
    { name: 'Rejected', count: rejectedClaims, fill: '#ef4444' },
    { name: 'Flagged', count: flaggedClaims, fill: '#f59e0b' },
  ];

  return (
    <ThemeProvider theme={theme}>
      {/* Main container - this will now handle the overall layout and contain the scrollable content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh', // Make the overall app take full viewport height
          background: `
            linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%),
            linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 30%, #cbd5e1 100%)
          `,
          position: 'relative',
          zIndex: 1,
          backgroundSize: 'cover',
        }}
      >
        {/* Enhanced Header - now sticky and won't scroll with content */}
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
            position: 'sticky', // Changed to sticky
            top: 0,
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
                Insurer Dashboard
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

        {/* Main Content - now the primary scrollable area */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', pb: 8 }}> {/* flexGrow makes it take available space */}
          <Container maxWidth="xl" sx={{ py: 5 }}>
            {/* Welcome Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
              <Box>
                 <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>
                  Welcome back{userName ? `, ${userName}` : ''}! 
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Monitor and manage all insurance claims efficiently
                </Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Button
                  variant={chartType === 'pie' ? 'contained' : 'outlined'}
                  startIcon={<PieChartIcon />}
                  onClick={() => setChartType('pie')}
                >
                  Pie Chart
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'contained' : 'outlined'}
                  startIcon={<BarChartIcon />}
                  onClick={() => setChartType('bar')}
                >
                  Bar Chart
                </Button>
              </Box>
            </Box>

            {/* Enhanced Hero Banner */}
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
                    AI-Powered Claims Intelligence
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)' }} mb={3}>
                    Advanced analytics and machine learning to detect fraud, streamline processing, and improve decision accuracy.
                  </Typography>
                  <Box display="flex" gap={4} mt={3}>
                    <Box textAlign="center">
                      <Typography variant="h3" fontWeight={800} color="white">
                        {totalClaims}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Total Claims
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h3" fontWeight={800} color="white">
                        85%
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Accuracy Rate
                      </Typography>
                    </Box>
                  </Box>
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
                    <TrendingUpIcon sx={{ fontSize: 60, color: 'white' }} />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Charts Section */}
            <Grid container spacing={4} mb={5}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    minHeight: '400px', 
                    minWidth:'700px',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    width: '100%',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(30, 58, 138, 0.2)',
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" mb={3}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        mr: 2,
                      }}
                    >
                      {chartType === 'pie' ? <PieChartIcon color="primary" /> : <BarChartIcon color="primary" />}
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        Claims Distribution
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Overview of claim statuses
                      </Typography>
                    </Box>
                  </Box>

                  <ResponsiveContainer width="100%" height={300}>
                    {chartType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    ) : (
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 4, height: '100%', minHeight: '400px' }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        mr: 2,
                      }}
                    >
                      <LightbulbIcon sx={{ color: '#f59e0b' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        AI Insights
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Machine learning analytics
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Box textAlign="center" p={2} sx={{ backgroundColor: '#fef3c7', borderRadius: 2 }}>
                          <Typography variant="h4" fontWeight={700} color="#f59e0b">
                            {flaggedClaims}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Flagged Claims
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center" p={2} sx={{ backgroundColor: '#d1fae5', borderRadius: 2 }}>
                          <Typography variant="h4" fontWeight={700} color="#10b981">
                            85%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Model Accuracy
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box p={2} sx={{ backgroundColor: '#eff6ff', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            Processing Time Reduction
                          </Typography>
                          <Typography variant="h5" fontWeight={600} color="primary.main">
                            60% faster with AI automation
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Claims Table */}
            <Paper elevation={0} sx={{ overflow: 'hidden', mb: 4 }}>
              <Box
                px={4}
                py={3}
                borderBottom={1}
                borderColor="divider"
                sx={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                }}
              >
                <Typography variant="h5" fontWeight={600} color="primary.main" mb={1}>
                  Recent Claims
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Overview of the most recent claim submissions.
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search claims..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ minWidth: 300 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={handleFilterClick}
                  >
                    {statusFilter === 'All' ? 'All Statuses' : statusFilter}
                  </Button>
                  <Menu
                    anchorEl={filterAnchorEl}
                    open={Boolean(filterAnchorEl)}
                    onClose={() => handleFilterClose()}
                  >
                    {['All', 'In Review', 'Approved', 'Rejected', 'Flagged'].map((status) => (
                      <MenuItem key={status} onClick={() => handleFilterClose(status)}>
                        {status}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'rgba(30, 58, 138, 0.05)' }}>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Claim ID</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Claimant</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Submitted</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredClaims.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                            <Typography variant="h6" color="text.secondary" mb={1}>
                              No claims found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Try adjusting your search or filter criteria
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredClaims.map((claim) => (
                          <TableRow
                            key={claim.claimId}
                            hover
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(30, 58, 138, 0.03)',
                              },
                            }}
                          >
                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {claim.claimId}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{claim.fullName}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>
                              {claim.createdAt?.toDate().toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={claim.status}
                                {...getChipProps(claim.status)}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {claim.ocrData?.['Claimed Amount'] ? `Ksh ${claim.ocrData['Claimed Amount']}` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="contained"
                                href={`/claim-details2/${claim.id}`}
                                sx={{ minWidth: 'auto', px: 2 }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default InsurerDashboard;