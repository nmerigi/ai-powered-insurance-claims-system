import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Box,
  Chip,
  Link as MuiLink,
  Button,
  Container,
  Paper,
  IconButton,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  PersonOutline as PersonOutlineIcon,
  LocalShippingOutlined as LocalShippingOutlinedIcon,
  InsertDriveFileOutlined as InsertDriveFileOutlinedIcon,
  HelpOutline as HelpOutlineIcon,
  CallOutlined as CallOutlinedIcon,
  EmailOutlined as EmailOutlinedIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
  ReceiptOutlined as ReceiptOutlinedIcon,
  AssignmentOutlined as AssignmentOutlinedIcon,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';
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

const ClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Helper function to get customer-facing status (same as dashboard)
  const getCustomerStatus = (actualStatus) => {
    // If status is "Flagged", show "In Review" to customer
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
    const fetchClaim = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Fetch user info for header
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserName((userSnap.data().fullName || '').split(' ')[0]);
          }
        }

        const docRef = doc(db, 'claims', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setClaim(docSnap.data());
        } else {
          console.error('Claim not found');
        }
      } catch (error) {
        console.error('Error fetching claim:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [id]);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box 
          sx={{ 
            minHeight: '100vh',
            background: `
              linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%),
              linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 30%, #cbd5e1 100%)
            `,
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </ThemeProvider>
    );
  }

  if (!claim) {
    return (
      <ThemeProvider theme={theme}>
        <Box 
          sx={{ 
            minHeight: '100vh',
            background: `
              linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%),
              linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 30%, #cbd5e1 100%)
            `,
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
        >
          <Typography variant="h6" align="center" color="text.primary">
            Claim not found.
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  const {
    claimId,
    createdAt,
    fullName,
    email,
    phone,
    address,
    status,
    fileUrl,
    ocrData = {},
    reviewResult = {},
    claimType = 'Outpatient Visit',
    policyNumber = 'ABC-123456',
    idNumber = 'ID123456789'
  } = claim;

  // Get customer-facing status
  const displayStatus = getCustomerStatus(status);
  
  // Only show AI review results if status is not "Flagged"
  const shouldShowAIReview = status !== 'Flagged' && reviewResult.label;

  const actualIncidentDate = ocrData['Date of Treatment'] || 'N/A';
  const diagnosis = ocrData.Diagnosis || 'N/A';
  const treatmentDetails = ocrData['Treatment Details'] || 'N/A';
  const claimedAmount = ocrData['Claimed Amount'] ? `Ksh ${ocrData['Claimed Amount']}` : 'N/A';
  const patientName = ocrData['Patient Name'] || 'N/A';
  const doctorName = ocrData['Doctor\'s Name'] || 'N/A';
  const hospitalName = ocrData['Hospital Name'] || 'N/A';

  const submissionDate = createdAt ? new Date(createdAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-') : 'N/A';

  const DetailItem = ({ icon, label, value }) => (
    <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'primary.main' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        <Typography variant="body1" color="text.primary" fontWeight={600}>
          {value}
        </Typography>
      </Box>
    </Grid>
  );

  const cardStyle = {
    mb: 3,
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(30, 58, 138, 0.08)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 16px 48px rgba(30, 58, 138, 0.12)',
    },
  };

  const sectionTitleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 2,
    fontWeight: 700,
    color: 'primary.main',
    fontSize: '1.25rem'
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('CLAIM REPORT', 20, 20);
    
    let y = 40;
    
    // Add data
    doc.setFontSize(12);
    doc.text(`Claim ID: ${claimId || 'N/A'}`, 20, y); y += 10;
    doc.text(`Claimant: ${fullName || 'N/A'}`, 20, y); y += 10;
    doc.text(`Status: ${displayStatus || 'N/A'}`, 20, y); y += 10;
    doc.text(`Hospital: ${hospitalName || 'N/A'}`, 20, y); y += 10;
    doc.text(`Doctor: ${doctorName || 'N/A'}`, 20, y); y += 10;
    doc.text(`Diagnosis: ${diagnosis || 'N/A'}`, 20, y); y += 10;
    doc.text(`Treatment: ${treatmentDetails || 'N/A'}`, 20, y); y += 10;
    
    // Save
    doc.save(`${claimId}-report.pdf`);
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
        {/* Enhanced Header matching dashboard */}
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
            <IconButton 
              onClick={() => navigate('/claimant-dashboard')}
              sx={{ 
                mr: 2,
                '&:hover': { backgroundColor: 'rgba(30, 58, 138, 0.1)' }
              }}
            >
              <ArrowBackIcon sx={{ color: 'primary.main' }} />
            </IconButton>
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
                Claim Details
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
            {/* Page Title Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
              <Box>
                <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>
                  Claim Details
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Complete information about your claim submission
                </Typography>
              </Box>
            </Box>

            {/* Main Grid container for the two columns */}
            <Grid container spacing={4}>
              {/* Left Column: Claim Details (main content) */}
              <Grid item xs={12} md={8} lg={9}>
                {/* Claim Overview Card */}
                <Paper elevation={0} sx={cardStyle}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={sectionTitleStyle}>
                      <ReceiptOutlinedIcon /> Claim Overview
                    </Typography>
                    <Divider sx={{ mb: 4, background: 'linear-gradient(90deg, #2563eb, transparent)' }} />
                    <Grid container spacing={4}>
                      <DetailItem icon={<ReceiptOutlinedIcon fontSize="small" />} label="Claim ID" value={claimId} />
                      <DetailItem icon={<PersonOutlineIcon fontSize="small" />} label="Claimant" value={fullName} />
                      <DetailItem icon={<AccessTimeIcon fontSize="small" />} label="Submission Date" value={submissionDate} />
                      <DetailItem icon={<LocalShippingOutlinedIcon fontSize="small" />} label="Claim Type" value={claimType} />
                      <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'primary.main' }}>
                          <AssignmentOutlinedIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            Status
                          </Typography>
                          <Chip
                            label={displayStatus}
                            color={
                              displayStatus === 'Approved' ? 'success' :
                              displayStatus === 'Rejected' ? 'error' :
                              'info'
                            }
                            variant="outlined"
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              borderRadius: '8px',
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Paper>

                {/* Submitted Details Card with enhanced styling */}
                <Paper elevation={0} sx={cardStyle}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={sectionTitleStyle}>
                      <AssignmentOutlinedIcon /> Submitted Details
                    </Typography>
                    <Divider sx={{ mb: 4, background: 'linear-gradient(90deg, #2563eb, transparent)' }} />
                    
                    {/* Personal Information Section */}
                    <Box sx={{ 
                      p: 3, 
                      mb: 4,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
                      border: '1px solid rgba(37, 99, 235, 0.1)'
                    }}>
                      <Typography variant="subtitle1" fontWeight={700} mb={3} sx={{ color: 'primary.main' }}>
                        Personal Information
                      </Typography>
                      <Grid container spacing={4}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>Full Name</Typography>
                          <Typography variant="body1" color="text.primary" fontWeight={600}>{fullName}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>ID Number</Typography>
                          <Typography variant="body1" color="text.primary" fontWeight={600}>{idNumber}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>Phone Number</Typography>
                          <Typography variant="body1" color="text.primary" fontWeight={600}>{phone}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>Email Address</Typography>
                          <Typography variant="body1" color="text.primary" fontWeight={600}>{email}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>Policy Number</Typography>
                          <Typography variant="body1" color="text.primary" fontWeight={600}>{policyNumber}</Typography>
                        </Grid>
                        {patientName && patientName !== fullName && (
                          <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>Patient Name</Typography>
                            <Typography variant="body1" color="text.primary" fontWeight={600}>{patientName}</Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    {/* Medical Information Section */}
                    <Box sx={{ 
                      p: 3, 
                      mb: 4,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.1)'
                    }}>
                      <Typography variant="subtitle1" fontWeight={700} mb={3} sx={{ color: 'primary.main' }}>
                        Medical Information
                      </Typography>
                      <Grid container spacing={4}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>Hospital Name</Typography>
                          <Typography variant="body1" color="text.primary" fontWeight={600}>{hospitalName}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>Doctor's Name</Typography>
                          <Typography variant="body1" color="text.primary" fontWeight={600}>{doctorName}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>Date of Treatment</Typography>
                          <Typography variant="body1" color="text.primary" fontWeight={600}>{actualIncidentDate}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>Claimed Amount</Typography>
                          <Typography variant="body1" color="text.primary" fontWeight={600}>{claimedAmount}</Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Diagnosis & Treatment Section */}
                    <Box sx={{ 
                      p: 3, 
                      mb: 4,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)', 
                      border: '1px solid rgba(245, 158, 11, 0.1)'
                    }}>
                      <Typography variant="subtitle1" fontWeight={700} mb={3} sx={{ color: 'primary.main' }}>
                        Diagnosis & Treatment
                      </Typography>
                      <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
                        <Typography component="span" fontWeight={700}>Diagnosis:</Typography> {diagnosis}
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        <Typography component="span" fontWeight={700}>Treatment:</Typography> {treatmentDetails}
                      </Typography>
                    </Box>

                    {/* Uploaded Documents Section */}
                    <Box sx={{ 
                      p: 3,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      border: '1px solid #cbd5e1'
                    }}>
                      <Typography variant="subtitle1" fontWeight={700} mb={3} sx={{ color: 'primary.main' }}>
                        Uploaded Documents
                      </Typography>
                      <Grid container alignItems="center" justifyContent="space-between">
                        <Grid item>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              backgroundColor: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <InsertDriveFileOutlinedIcon sx={{ color: 'white' }} />
                            </Box>
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                Initial Claim Form.pdf
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                PDF Document • 2024-03-15 10:30 AM
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item>
                          {fileUrl && (
                            <Button
                              variant="outlined"
                              startIcon={<VisibilityOutlinedIcon />}
                              onClick={() => window.open(fileUrl, '_blank')}
                              sx={{ borderRadius: '8px' }}
                            >
                              View Document
                            </Button>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Paper>

                {/* AI Review Card - Only show if not flagged */}
                {shouldShowAIReview && (
                  <Paper elevation={0} sx={cardStyle}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h6" sx={sectionTitleStyle}>
                        <AssignmentOutlinedIcon /> Review Results
                      </Typography>
                      <Divider sx={{ mb: 4, background: 'linear-gradient(90deg, #2563eb, transparent)' }} />
                      <Box sx={{ 
                        p: 3,
                        borderRadius: '12px',
                        background:'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.1)'
                      }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>Outcome</Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={600} mb={2}>{reviewResult.label}</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500} mb={2}>Explanation</Typography>
                        <Box>
                          {reviewResult.explanation?.map((reason, index) => (
                            <Chip
                              key={index}
                              label={reason}
                              color="warning"
                              variant="outlined"
                              size="medium"
                              sx={{ mr: 1, mb: 1, borderRadius: '8px', fontWeight: 500 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                  </Paper>
                )}
              </Grid>

              {/* Right Column: Need Help? & Actions */}
              <Grid item xs={12} md={4} lg={3}>
                {/* Need Help Card */}
                <Paper elevation={0} sx={cardStyle}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={sectionTitleStyle}>
                      <HelpOutlineIcon /> Need Help?
                    </Typography>
                    <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2563eb, transparent)' }} />

                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 3,
                      p: 2,
                      borderRadius: '8px',
                      backgroundColor: 'rgba(37, 99, 235, 0.05)'
                    }}>
                      <CallOutlinedIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          Call Support
                        </Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={600}>
                          +25412378946
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 3,
                      p: 2,
                      borderRadius: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.05)'
                    }}>
                      <EmailOutlinedIcon sx={{ mr: 2, color: 'success.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          Email Support
                        </Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={600}>
                          support@claimsmart.com
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      p: 2,
                      borderRadius: '8px',
                      backgroundColor: 'rgba(245, 158, 11, 0.05)'
                    }}>
                      <AccessTimeIcon sx={{ mr: 2, color: '#f59e0b' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          Business Hours
                        </Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={600}>
                          Mon - Fri : 8AM - 5PM
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Paper>

                {/* Quick Actions Card */}
                <Paper elevation={0} sx={cardStyle}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={sectionTitleStyle}>
                      <DescriptionOutlinedIcon /> Quick Actions
                    </Typography>
                    <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2563eb, transparent)' }} />
                    
                    <Button 
                      variant="contained" 
                      fullWidth 
                      onClick={handleDownloadReport}
                      sx={{ 
                        mb: 2,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                      }}
                      startIcon={<DescriptionOutlinedIcon />}
                    >
                      Generate PDF Report
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      onClick={() => navigate('/claimant-dashboard')}
                      sx={{ 
                        py: 1.5,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(37, 99, 235, 0.05)',
                          borderColor: 'primary.dark',
                        }
                      }}
                      startIcon={<ArrowBackIcon />}
                    >
                      Back to Dashboard
                    </Button>
                  </CardContent>
                </Paper>

                {/* Status Timeline Card (if you want to add this feature) */}
                <Paper elevation={0} sx={cardStyle}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={sectionTitleStyle}>
                      <AccessTimeIcon /> Status Timeline
                    </Typography>
                    <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2563eb, transparent)' }} />
                    
                    <Box sx={{ position: 'relative' }}>
                      {/* Timeline items */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: 'success.main',
                          mr: 2,
                          border: '2px solid white',
                          boxShadow: '0 0 0 2px #10b981'
                        }} />
                        <Box>
                          <Typography variant="body2" color="text.primary" fontWeight={600}>
                            Claim Submitted
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {submissionDate}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: displayStatus === 'In Review' ? '#f59e0b' : 
                                          displayStatus === 'Approved' ? 'success.main' : 
                                          displayStatus === 'Rejected' ? 'error.main' : '#9ca3af',
                          mr: 2,
                          border: '2px solid white',
                          boxShadow: `0 0 0 2px ${
                            displayStatus === 'In Review' ? '#f59e0b' : 
                            displayStatus === 'Approved' ? '#10b981' : 
                            displayStatus === 'Rejected' ? '#ef4444' : '#9ca3af'
                          }`
                        }} />
                        <Box>
                          <Typography variant="body2" color="text.primary" fontWeight={600}>
                            {displayStatus}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Current Status
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ClaimDetails;