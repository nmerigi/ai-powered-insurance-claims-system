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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  Paper,
  IconButton,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
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
  CheckCircleOutline as CheckCircleOutlineIcon,
  CancelOutlined as CancelOutlinedIcon,
  FlagOutlined as FlagOutlinedIcon,
  GavelOutlined as GavelOutlinedIcon,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
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

const ClaimDetails2 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDecisionDialog, setOpenDecisionDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingDecision, setPendingDecision] = useState(null);
  const [insurerComment, setInsurerComment] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  // Function to update claim status in Firestore
  const updateClaimStatus = async (newStatus) => {
    try {
      const claimRef = doc(db, 'claims', id);
      await updateDoc(claimRef, { status: newStatus });
      setClaim((prevClaim) => ({ ...prevClaim, status: newStatus }));
      console.log(`Claim ${id} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating claim status:', error);
    }
  };

  // Dialog handlers
  const handleOpenDialog = (statusToSet) => {
    setPendingStatus(statusToSet);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPendingStatus(null);
    setInsurerComment('');
  };

  const handleConfirmStatusChange = () => {
    if (pendingStatus) {
      updateClaimStatus(pendingStatus);
      handleCloseDialog();
    }
  };

  const handleOpenDecisionDialog = (decision) => {
    setPendingDecision(decision);
    setOpenDecisionDialog(true);
  };

  const handleCloseDecisionDialog = () => {
    setOpenDecisionDialog(false);
    setPendingDecision(null);
    setInsurerComment('');
  };

  const handleConfirmDecision = () => {
    if (pendingDecision) {
      handleDecision(pendingDecision);
      handleCloseDecisionDialog();
    }
  };

  // Fixed handleDecision function
  const handleDecision = async (decision) => {
    try {
      const claimRef = doc(db, 'claims', id);
      const decisionTime = new Date();

      const newHistoryEntry = {
        type: 'Insurer Decision',
        status: decision,
        comment: insurerComment || 'No comment provided',
        timestamp: Timestamp.fromDate(decisionTime),
      };

      await updateDoc(claimRef, {
        status: decision,
        history: arrayUnion(newHistoryEntry),
      });

      setClaim(prevClaim => ({
        ...prevClaim,
        status: decision,
        history: [...(prevClaim.history || []), newHistoryEntry]
      }));

      setSnackbar({
        open: true,
        message: `Claim ${decision.toLowerCase()} successfully`,
        severity: 'success'
      });

      setInsurerComment('');

      setTimeout(() => {
        navigate('/insurer-dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error updating decision:', error);
      setSnackbar({
        open: true,
        message: 'Error updating claim',
        severity: 'error'
      });
    }
  };

  // Function to render history timeline
  const renderHistory = () => {
    if (!claim?.history || claim.history.length === 0) {
      return (
        <Paper elevation={0} sx={cardStyle}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={sectionTitleStyle}>
              <AccessTimeIcon /> Claim History
            </Typography>
            <Divider sx={{ mb: 4, background: 'linear-gradient(90deg, #2563eb, transparent)' }} />
            <Typography variant="body2" color="text.secondary">
              No history available for this claim.
            </Typography>
          </CardContent>
        </Paper>
      );
    }

    const sortedHistory = [...claim.history].sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0;
      const timeB = b.timestamp?.seconds || 0;
      return timeB - timeA;
    });

    return (
      <Paper elevation={0} sx={cardStyle}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={sectionTitleStyle}>
            <AccessTimeIcon /> Claim History
          </Typography>
          <Divider sx={{ mb: 4, background: 'linear-gradient(90deg, #2563eb, transparent)' }} />
          <Box sx={{ position: 'relative', pl: 2 }}>
            <Box
              sx={{
                position: 'absolute',
                left: '20px',
                top: '8px',
                bottom: '8px',
                width: '2px',
                bgcolor: 'rgba(37, 99, 235, 0.2)',
              }}
            />
            
            {sortedHistory.map((entry, idx) => (
              <Box key={idx} sx={{ position: 'relative', pb: 3, '&:last-child': { pb: 0 } }}>
                <Box
                  sx={{
                    position: 'absolute',
                    left: '-8px',
                    top: '4px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    bgcolor: 
                      entry.type === 'AI Review' ? '#f59e0b' : 
                      entry.status === 'Approved' ? '#10b981' :
                      entry.status === 'Rejected' ? '#ef4444' :
                      'primary.main',
                    border: '3px solid white',
                    boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)',
                  }}
                />
                
                <Box sx={{ ml: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                      {entry.type || 'Status Update'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {entry.timestamp?.seconds 
                        ? new Date(entry.timestamp.seconds * 1000).toLocaleString()
                        : 'Unknown time'
                      }
                    </Typography>
                  </Box>
                  
                  <Chip
                    label={entry.status}
                    size="small"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      borderRadius: '8px',
                      ...(entry.status === 'Approved' && { 
                        backgroundColor: '#d1fae5', 
                        color: '#047857',
                        border: '1px solid #10b981'
                      }),
                      ...(entry.status === 'Rejected' && { 
                        backgroundColor: '#fee2e2', 
                        color: '#dc2626',
                        border: '1px solid #ef4444'
                      }),
                      ...(entry.status === 'Flagged' && { 
                        backgroundColor: '#fffde7', 
                        color: '#ff8f00',
                        border: '1px solid #f59e0b'
                      }),
                      ...(entry.status === 'In Review' && { 
                        backgroundColor: '#dbeafe', 
                        color: '#1d4ed8',
                        border: '1px solid #3b82f6'
                      }),
                    }}
                  />
                  
                  {entry.explanation && Array.isArray(entry.explanation) && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <Typography component="span" fontWeight={600}>Reasons:</Typography> {entry.explanation.join(', ')}
                    </Typography>
                  )}
                  {entry.explanation && typeof entry.explanation === 'string' && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <Typography component="span" fontWeight={600}>Reason:</Typography> {entry.explanation}
                    </Typography>
                  )}
                  {entry.comment && (
                    <Typography variant="body2" color="text.secondary">
                      <Typography component="span" fontWeight={600}>Comment:</Typography> {entry.comment}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Paper>
    );
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('CLAIM REPORT', 20, 20);
    
    let y = 40;
    
    doc.setFontSize(12);
    doc.text(`Claim ID: ${claim?.claimId || 'N/A'}`, 20, y); y += 10;
    doc.text(`Claimant: ${claim?.fullName || 'N/A'}`, 20, y); y += 10;
    doc.text(`Status: ${claim?.status || 'N/A'}`, 20, y); y += 10;
    doc.text(`Hospital: ${claim?.ocrData?.['Hospital Name'] || 'N/A'}`, 20, y); y += 10;
    doc.text(`Doctor: ${claim?.ocrData?.['Doctor\'s Name'] || 'N/A'}`, 20, y); y += 10;
    doc.text(`Diagnosis: ${claim?.ocrData?.Diagnosis || 'N/A'}`, 20, y); y += 10;
    doc.text(`Treatment: ${claim?.ocrData?.['Treatment Details'] || 'N/A'}`, 20, y); y += 10;
    
    doc.save(`${claim?.claimId || 'claim'}-report.pdf`);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
    status,
    fileUrl,
    ocrData = {},
    reviewResult = {},
    claimType = 'Outpatient Visit',
    policyNumber = 'ABC-123456',
    idNumber = 'ID123456789'
  } = claim;

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

  return (
  <ThemeProvider theme={theme}>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: `
          linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%),
          linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)
        `,
        position: 'relative',
        zIndex: 1,
        backgroundSize: 'cover',
      }}
    >
      {/* Enhanced Header */}
      <Paper
        elevation={0}
        sx={{
          py: 2.5,
          px: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 0,
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 4px 20px rgba(30, 58, 138, 0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box display="flex" alignItems="center">
          <IconButton 
            onClick={() => navigate('/insurer-dashboard')}
            sx={{ 
              mr: 2,
              background: 'rgba(37, 99, 235, 0.1)',
              '&:hover': { 
                backgroundColor: 'rgba(30, 58, 138, 0.15)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            <ArrowBackIcon sx={{ color: 'primary.main' }} />
          </IconButton>
          <Box
            width={52}
            height={52}
            borderRadius={4}
            mr={3}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
            }}
          >
            <SecurityIcon sx={{ color: 'white', fontSize: 30 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} color="primary.main">
              SmartClaims
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Insurer - Claim Details
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            sx={{
              background: 'rgba(37, 99, 235, 0.1)',
              '&:hover': { backgroundColor: 'rgba(30, 58, 138, 0.15)' }
            }}
          >
            <NotificationsIcon sx={{ color: 'primary.main' }} />
          </IconButton>
          <Button
            onClick={handleMenuOpen}
            sx={{
              minWidth: 'auto',
              p: 1,
              borderRadius: 3,
              color: 'text.primary',
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
          >
            <Avatar sx={{ width: 36, height: 36, mr: 1, bgcolor: 'primary.main', fontWeight: 600 }}>
              {userName.charAt(0)}
            </Avatar>
            <ExpandMoreIcon fontSize="small" />
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { 
                mt: 1, 
                minWidth: 220,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(30, 58, 138, 0.15)',
              }
            }}
          >
            <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
              <PersonIcon fontSize="small" sx={{ mr: 2 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
              <SettingsIcon fontSize="small" sx={{ mr: 2 }} />
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.5 }}>
              <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pb: 8 }}>
        <Container maxWidth="xl" sx={{ py: 6 }}>
          {/* Page Title Section */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
            <Box>
              <Typography variant="h3" fontWeight={800} color="primary.main" mb={1}>
                Claim Details - Review
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={500}>
                Complete review and decision management
              </Typography>
            </Box>
          </Box>

          {/* Main Grid container - Adjusted spacing */}
          <Grid container spacing={5}>
            {/* Left Column - Made wider */}
            <Grid item xs={12} md={7} lg={8}>
              {/* Claim Overview Card */}
              <Paper elevation={0} sx={cardStyle}>
                <CardContent sx={{ p: 5 }}>
                  <Typography variant="h6" sx={sectionTitleStyle}>
                    <ReceiptOutlinedIcon /> Claim Overview
                  </Typography>
                  <Divider sx={{ mb: 5, background: 'linear-gradient(90deg, #2563eb, transparent)' }} />
                  <Grid container spacing={5}>
                    <DetailItem icon={<ReceiptOutlinedIcon fontSize="small" />} label="Claim ID" value={claimId} />
                    <DetailItem icon={<PersonOutlineIcon fontSize="small" />} label="Claimant" value={fullName} />
                    <DetailItem icon={<AccessTimeIcon fontSize="small" />} label="Submission Date" value={submissionDate} />
                    <DetailItem icon={<LocalShippingOutlinedIcon fontSize="small" />} label="Claim Type" value={claimType} />
                    <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'primary.main' }}>
                        <AssignmentOutlinedIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          Status
                        </Typography>
                        <Chip
                          label={status}
                          size="medium"
                          sx={{
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            px: 1,
                            ...(status === 'Rejected' && {
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              border: '2px solid #fecaca'
                            }),
                            ...(status === 'In Review' && {
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              border: '2px solid #dbeafe'
                            }),
                            ...(status === 'Approved' && {
                              backgroundColor: '#f0fdf4',
                              color: '#16a34a',
                              border: '2px solid #bbf7d0'
                            }),
                            ...(status === 'Flagged' && {
                              backgroundColor: '#fffbeb',
                              color: '#d97706',
                              border: '2px solid #fed7aa'
                            }),
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Paper>

              {/* Submitted Details Card */}
              <Paper elevation={0} sx={cardStyle}>
                <CardContent sx={{ p: 5 }}>
                  <Typography variant="h6" sx={sectionTitleStyle}>
                    <AssignmentOutlinedIcon /> Submitted Details
                  </Typography>
                  <Divider sx={{ mb: 5, background: 'linear-gradient(90deg, #2563eb, transparent)' }} />

                  {/* Personal Information Section */}
                  <Box sx={{ 
                    p: 4, 
                    mb: 5,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
                    border: '2px solid rgba(37, 99, 235, 0.1)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.05)'
                  }}>
                    <Typography variant="h6" fontWeight={800} mb={4} sx={{ color: 'primary.main' }}>
                      Personal Information
                    </Typography>
                    <Grid container spacing={5}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Full Name</Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={700}>{fullName}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>ID Number</Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={700}>{idNumber}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Phone Number</Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={700}>{phone}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Email Address</Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={700}>{email}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Policy Number</Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={700}>{policyNumber}</Typography>
                      </Grid>
                      {patientName && patientName !== fullName && (
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>Patient Name</Typography>
                          <Typography variant="body1" color="text.primary" fontWeight={700}>{patientName}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  <Box sx={{ 
                    p: 4, 
                    mb: 5,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
                    border: '2px solid rgba(37, 99, 235, 0.1)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.05)'
                  }}>
                    <Typography variant="h6" fontWeight={800} mb={4} sx={{ color: 'primary.main' }}>
                      Medical Information
                    </Typography>
                    <Grid container spacing={5}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Hospital Name</Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={700}>{hospitalName}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Doctor's Name</Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={700}>{doctorName}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Claimed Amount</Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={700}>{claimedAmount}</Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Incident Details Section */}
                  <Box sx={{ 
                    p: 4, 
                    mb: 4,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
                    border: '2px solid rgba(37, 99, 235, 0.1)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.05)'
                  }}>
                    <Typography variant="h6" fontWeight={800} mb={4} sx={{ color: 'primary.main' }}>
                      Incident Details
                    </Typography>
                    <Grid container spacing={5}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Date of Treatment</Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={700}>{actualIncidentDate}</Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Diagnosis & Treatment */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
                    <DescriptionOutlinedIcon fontSize="medium" sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={800} sx={{ color: 'primary.main' }}>
                      Diagnosis & Treatment
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 4, 
                    mb: 5,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
                    border: '2px solid rgba(37, 99, 235, 0.1)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.05)'
                  }}>
                    <Typography variant="body1" color="text.primary" sx={{ mb: 3, lineHeight: 1.6 }}>
                      <Typography component="span" fontWeight={800} color="primary.main">Diagnosis:</Typography> {diagnosis}
                    </Typography>
                    <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.6 }}>
                      <Typography component="span" fontWeight={800} color="primary.main">Treatment:</Typography> {treatmentDetails}
                    </Typography>
                  </Box>

                  {/* Uploaded Documents */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
                    <InsertDriveFileOutlinedIcon fontSize="medium" sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={800} sx={{ color: 'primary.main' }}>
                      Uploaded Documents
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 4,
                    mb: 5,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(148, 163, 184, 0.1)'
                  }}>
                    <Grid container alignItems="center" justifyContent="space-between">
                      <Grid item>
                        <Box display="flex" alignItems="center" gap={3}>
                          <Box sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                          }}>
                            <InsertDriveFileOutlinedIcon sx={{ color: 'white', fontSize: 28 }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight={700}>
                              Initial Claim Form.pdf
                            </Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                              PDF Document • {submissionDate}
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
                            sx={{ 
                              borderRadius: '12px',
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              fontWeight: 600,
                              px: 3,
                              py: 1.5,
                              border: '2px solid',
                              '&:hover': {
                                backgroundColor: 'rgba(37, 99, 235, 0.05)',
                                borderColor: 'primary.dark',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                              }
                            }}
                          >
                            View Document
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Paper>

              {/* AI Review Card */}
              {reviewResult.label && (
                <Paper elevation={0} sx={cardStyle}>
                  <CardContent sx={{ p: 5 }}>
                    <Typography variant="h6" sx={sectionTitleStyle}>
                      <AssignmentOutlinedIcon /> AI Review
                    </Typography>
                    <Divider sx={{ mb: 5, background: 'linear-gradient(90deg, #2563eb, transparent)' }} />
                    <Box sx={{ 
                      p: 4,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 50%, #f59e0b 100%)',
                      border: '2px solid rgba(245, 158, 11, 0.2)',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
                    }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600} mb={2}>Outcome</Typography>
                      <Typography variant="h6" color="text.primary" fontWeight={800} mb={3}>{reviewResult.label}</Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600} mb={3}>Explanation</Typography> 
                      <Box>
                        {reviewResult.explanation?.map((reason, index) => (
                          <Chip
                            key={index}
                            label={reason}
                            color="warning"
                            variant="outlined"
                            size="medium" 
                            sx={{ 
                              mr: 1.5, 
                              mb: 1.5, 
                              marginTop: 1, 
                              borderRadius: '12px', 
                              fontWeight: 600, 
                              fontSize: '0.9rem',
                              border: '2px solid',
                              py: 1
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Paper>
              )}
            </Grid>

            {/* Right Column - Made narrower to balance */}
            <Grid item xs={12} md={5} lg={4}>
              {/* Status Management Card */}
              <Paper elevation={0} sx={cardStyle}>
                <CardContent sx={{ p: 5 }}>
                  <Typography variant="h6" sx={sectionTitleStyle}>
                    <GavelOutlinedIcon /> Claim Actions
                  </Typography>
                  <Divider sx={{ mb: 5, background: 'linear-gradient(90deg, #2563eb, transparent)' }} />

                  <Box sx={{ 
                    mb: 4, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 3,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    border: '2px solid rgba(37, 99, 235, 0.1)'
                  }}>
                    <Typography variant="body1" color="text.secondary" fontWeight={600}>Current Status:</Typography>
                    <Chip
                      label={status}
                      size="medium" 
                      sx={{
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        px: 1.5,
                        py: 0.5,
                        ...(status === 'Rejected' && {
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '2px solid #fecaca'
                        }),
                        ...(status === 'In Review' && {
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          border: '2px solid #dbeafe'
                        }),
                        ...(status === 'Approved' && {
                          backgroundColor: '#f0fdf4',
                          color: '#16a34a',
                          border: '2px solid #bbf7d0'
                        }),
                        ...(status === 'Flagged' && {
                          backgroundColor: '#fffbeb',
                          color: '#d97706',
                          border: '2px solid #fed7aa'
                        }),
                      }}
                      icon={
                        status === 'Approved' ? <CheckCircleOutlineIcon /> :
                        status === 'Rejected' ? <CancelOutlinedIcon /> :
                        status === 'Flagged' ? <FlagOutlinedIcon /> :
                        null
                      }
                    />
                  </Box>

                  {status === 'Flagged' && (
                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Button
                        variant="contained"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={() => handleOpenDecisionDialog('Approved')}
                        sx={{ 
                          py: 2,
                          borderRadius: '16px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '1rem',
                          background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                          boxShadow: '0 6px 20px rgba(34, 197, 94, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4)',
                            background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                          },
                        }}
                      >
                        Approve Claim
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<CancelOutlinedIcon />}
                        onClick={() => handleOpenDecisionDialog('Rejected')}
                        sx={{ 
                          py: 2,
                          borderRadius: '16px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '1rem',
                          background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                          boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
                            background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                          },
                        }}
                      >
                        Reject Claim
                      </Button>
                    </Box>
                  )}
                  {status !== 'Flagged' && (
                    <Box sx={{ 
                      p: 3,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      border: '2px solid rgba(34, 197, 94, 0.15)'
                    }}>
                      <Typography variant="body1" color="text.secondary" fontWeight={600}>
                        Claim status is {status}. No actions needed at this time.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Paper>

              {/* History Timeline */}
              {renderHistory()}

              {/* Generate Report Button */}
              <Paper elevation={0} sx={{ ...cardStyle, mt: 4 }}>
                <CardContent sx={{ p: 5 }}>
                  <Typography variant="h6" sx={sectionTitleStyle}>
                    <DescriptionOutlinedIcon /> Download Report
                  </Typography>
                  <Divider sx={{ mb: 5, background: 'linear-gradient(90deg, #2563eb, transparent)' }} />
                  <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={handleDownloadReport}
                    sx={{ 
                      py: 2,
                      borderRadius: '16px',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                      },
                    }}
                    startIcon={<DescriptionOutlinedIcon />}
                  >
                    Generate PDF Report
                  </Button>
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* Decision Confirmation Dialog */}
        <Dialog
          open={openDecisionDialog}
          onClose={handleCloseDecisionDialog}
          aria-labelledby="decision-dialog-title"
          aria-describedby="decision-dialog-description"
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(30, 58, 138, 0.2)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            }
          }}
        >
          <DialogTitle 
            id="decision-dialog-title"
            sx={{ 
              pb: 2,
              pt: 4,
              px: 4,
              fontWeight: 800,
              fontSize: '1.5rem',
              color: pendingDecision === 'Approved' ? '#16a34a' : '#dc2626',
              borderBottom: '2px solid #f1f5f9',
              textAlign: 'center'
            }}
          >
            {pendingDecision === 'Approved' ? '✅ Approve Claim' : '❌ Reject Claim'}
          </DialogTitle>
          <DialogContent sx={{ pt: 4, px: 4 }}>
            <DialogContentText 
              id="decision-dialog-description" 
              sx={{ 
                mb: 4,
                color: 'text.primary',
                fontSize: '1.1rem',
                textAlign: 'center',
                fontWeight: 500
              }}
            >
              Are you sure you want to <strong>{pendingDecision?.toLowerCase()}</strong> this claim?
              This action cannot be undone.
            </DialogContentText>
            <TextField
              label="Add comment (optional)"
              multiline
              rows={4}
              fullWidth
              value={insurerComment}
              onChange={(e) => setInsurerComment(e.target.value)}
              placeholder="Please provide reason for your decision..."
              sx={{ 
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  fontSize: '1rem'
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 3, gap: 2 }}>
            <Button 
              onClick={handleCloseDecisionDialog} 
              sx={{ 
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                px: 3,
                py: 1.5,
                fontSize: '1rem'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDecision} 
              variant="contained"
              autoFocus
              sx={{ 
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                ...(pendingDecision === 'Approved' ? {
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                  boxShadow: '0 6px 20px rgba(34, 197, 94, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)',
                    background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                  },
                } : {
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
                    background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                  },
                })
              }}
            >
              {pendingDecision === 'Approved' ? '✅ Approve' : '❌ Reject'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            sx: {
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(30, 58, 138, 0.2)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            }
          }}
        >
          <DialogTitle 
            id="alert-dialog-title"
            sx={{ 
              fontWeight: 800,
              fontSize: '1.5rem',
              color: 'primary.main',
              borderBottom: '2px solid #f1f5f9',
              textAlign: 'center',
              pt: 4,
              pb: 2
            }}
          >
            🔄 Confirm Status Change
          </DialogTitle>
          <DialogContent sx={{ pt: 4, px: 4 }}>
            <DialogContentText 
              id="alert-dialog-description"
              sx={{ 
                color: 'text.primary',
                fontSize: '1.1rem',
                textAlign: 'center',
                fontWeight: 500
              }}
            >
              Are you sure you want to change the claim status to <strong>{pendingStatus}</strong>?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 3, gap: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              sx={{ 
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                px: 3,
                py: 1.5,
                fontSize: '1rem'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmStatusChange} 
              variant="contained"
              autoFocus
              sx={{ 
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                },
              }}
            >
              ✅ Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity} 
            sx={{ 
              width: '100%',
              borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(30, 58, 138, 0.2)',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        </Box>
       </Box>
      </ThemeProvider>
    );
};

export default ClaimDetails2;