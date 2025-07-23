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
} from '@mui/icons-material';

import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import jsPDF from 'jspdf';

// Removed @mui/lab Timeline imports - using custom timeline implementation

const ClaimDetails2 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDecisionDialog, setOpenDecisionDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingDecision, setPendingDecision] = useState(null);
  const [insurerComment, setInsurerComment] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchClaim = async () => {
      try {
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
    setInsurerComment(''); // Clear comment when closing
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
    setInsurerComment(''); // Clear comment when closing
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
      const claimRef = doc(db, 'claims', id); // Use id from useParams, not claimId
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

      // Update local state
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

      // Clear comment after successful update
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

  // Function to render history timeline (custom implementation)
  const renderHistory = () => {
    if (!claim?.history || claim.history.length === 0) {
      return (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Claim History</Typography>
            <Typography variant="body2" color="text.secondary">
              No history available for this claim.
            </Typography>
          </CardContent>
        </Card>
      );
    }

    // Sort history by timestamp (most recent first)
    const sortedHistory = [...claim.history].sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0;
      const timeB = b.timestamp?.seconds || 0;
      return timeB - timeA;
    });

    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Claim History</Typography>
          <Box sx={{ position: 'relative', pl: 2 }}>
            {/* Timeline line */}
            <Box
              sx={{
                position: 'absolute',
                left: '20px',
                top: '8px',
                bottom: '8px',
                width: '2px',
                bgcolor: 'divider',
              }}
            />
            
            {sortedHistory.map((entry, idx) => (
              <Box key={idx} sx={{ position: 'relative', pb: 3, '&:last-child': { pb: 0 } }}>
                {/* Timeline dot */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: '-8px',
                    top: '4px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    bgcolor: 
                      entry.type === 'AI Review' ? 'warning.main' : 
                      entry.status === 'Approved' ? 'success.main' :
                      entry.status === 'Rejected' ? 'error.main' :
                      'primary.main',
                    border: '2px solid',
                    borderColor: 'background.paper',
                    boxShadow: 1,
                  }}
                />
                
                {/* Timeline content */}
                <Box sx={{ ml: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {entry.type || 'Status Update'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
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
                      ...(entry.status === 'Approved' && { bgcolor: 'success.light', color: 'success.contrastText' }),
                      ...(entry.status === 'Rejected' && { bgcolor: 'error.light', color: 'error.contrastText' }),
                      ...(entry.status === 'Flagged' && { bgcolor: 'warning.light', color: 'warning.contrastText' }),
                      ...(entry.status === 'In Review' && { bgcolor: 'info.light', color: 'info.contrastText' }),
                    }}
                  />
                  
                  {entry.explanation && Array.isArray(entry.explanation) && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>Reasons:</strong> {entry.explanation.join(', ')}
                    </Typography>
                  )}
                  {entry.explanation && typeof entry.explanation === 'string' && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>Reason:</strong> {entry.explanation}
                    </Typography>
                  )}
                  {entry.comment && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Comment:</strong> {entry.comment}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('CLAIM REPORT', 20, 20);
    
    let y = 40;
    
    // Add data
    doc.setFontSize(12);
    doc.text(`Claim ID: ${claim?.claimId || 'N/A'}`, 20, y); y += 10;
    doc.text(`Claimant: ${claim?.fullName || 'N/A'}`, 20, y); y += 10;
    doc.text(`Status: ${claim?.status || 'N/A'}`, 20, y); y += 10;
    doc.text(`Hospital: ${claim?.ocrData?.['Hospital Name'] || 'N/A'}`, 20, y); y += 10;
    doc.text(`Doctor: ${claim?.ocrData?.['Doctor\'s Name'] || 'N/A'}`, 20, y); y += 10;
    doc.text(`Diagnosis: ${claim?.ocrData?.Diagnosis || 'N/A'}`, 20, y); y += 10;
    doc.text(`Treatment: ${claim?.ocrData?.['Treatment Details'] || 'N/A'}`, 20, y); y += 10;
    
    // Save
    doc.save(`${claim?.claimId || 'claim'}-report.pdf`);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!claim) {
    return (
      <Typography variant="h6" align="center" mt={5}>
        Claim not found.
      </Typography>
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
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'text.secondary' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        <Typography variant="body1" color="text.primary">
          {value}
        </Typography>
      </Box>
    </Grid>
  );

  const cardStyle = {
    mb: 3,
    borderRadius: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  };

  const sectionTitleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 2,
    fontWeight: 600,
    color: 'text.primary'
  };

  return (
    <Box sx={{
      bgcolor: '#f5f7fa',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      py: 4,
    }}>
      <Container
        maxWidth="xl"
        sx={{
          py: 4,
          bgcolor: 'transparent',
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
        }}
      >
        {/* Top Bar */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Claim Details 
          </Typography>
        </Box>

        {/* Main Grid container */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8} lg={9}>
            {/* Claim Overview Card */}
            <Card sx={cardStyle}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={sectionTitleStyle}>
                    Claim Overview
                  </Typography>
                </Box>
                <Divider sx={{ mb: 4 }} />
                <Grid container spacing={12}>
                  <DetailItem icon={<ReceiptOutlinedIcon fontSize="small" />} label="Claim ID" value={claimId} />
                  <DetailItem icon={<PersonOutlineIcon fontSize="small" />} label="Claimant" value={fullName} />
                  <DetailItem icon={<AccessTimeIcon fontSize="small" />} label="Submission Date" value={submissionDate} />
                  <DetailItem icon={<LocalShippingOutlinedIcon fontSize="small" />} label="Claim Type" value={claimType} />
                  <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'text.secondary' }}>
                      <AssignmentOutlinedIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Status
                      </Typography>
                      <Chip
                        label={status}
                        size="small"
                        sx={{
                          borderRadius: '4px',
                          fontWeight: 600,
                          ...(status === 'Rejected' && {
                            backgroundColor: '#ffebee',
                            color: '#d32f2f',
                          }),
                          ...(status === 'In Review' && {
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                          }),
                          ...(status === 'Approved' && {
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                          }),
                          ...(status === 'Flagged' && {
                            backgroundColor: '#fffde7',
                            color: '#ff8f00',
                          }),
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Submitted Details Card */}
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={sectionTitleStyle}>
                  <AssignmentOutlinedIcon /> Submitted Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Personal Information */}
                <Typography variant="subtitle1" fontWeight={600} mb={1} sx={{ color: 'text.primary' }}>
                  Personal Information
                </Typography>
                <Grid container spacing={12} mb={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Full Name</Typography>
                    <Typography variant="body1" color="text.primary">{fullName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>ID Number</Typography>
                    <Typography variant="body1" color="text.primary">{idNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Phone Number</Typography>
                    <Typography variant="body1" color="text.primary">{phone}</Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={12} mb={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Email Address</Typography>
                    <Typography variant="body1" color="text.primary">{email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Policy Number</Typography>
                    <Typography variant="body1" color="text.primary">{policyNumber}</Typography>
                  </Grid>
                  {patientName && patientName !== fullName && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>Patient Name</Typography>
                      <Typography variant="body1" color="text.primary">{patientName}</Typography>
                    </Grid>
                  )}
                </Grid>

                <Grid container spacing={12} mb={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Hospital Name</Typography>
                    <Typography variant="body1" color="text.primary">{hospitalName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Doctor's Name</Typography>
                    <Typography variant="body1" color="text.primary">{doctorName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Claimed Amount</Typography>
                    <Typography variant="body1" color="text.primary">{claimedAmount}</Typography>
                  </Grid>
                </Grid>

                {/* Incident Details */}
                <Typography variant="subtitle1" fontWeight={600} mb={1} sx={{ color: 'text.primary' }}>
                  Incident Details
                </Typography>
                <Grid container spacing={12} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Date of Treatment</Typography>
                    <Typography variant="body1" color="text.primary">{actualIncidentDate}</Typography>
                  </Grid>
                </Grid>

                {/* Diagnosis & Treatment */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DescriptionOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.primary' }}>
                    Diagnosis & Treatment
                  </Typography>
                </Box>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: 'grey.50', mb: 3 }}>
                  <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                    <Typography component="span" fontWeight={600}>Diagnosis:</Typography> {diagnosis}
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    <Typography component="span" fontWeight={600}>Treatment:</Typography> {treatmentDetails}
                  </Typography>
                </Card>

                {/* Uploaded Documents */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <InsertDriveFileOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.primary' }}>
                    Uploaded Documents
                  </Typography>
                </Box>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: 'grey.50' }}>
                  <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                      <Box display="flex" alignItems="center" gap={1}>
                        <InsertDriveFileOutlinedIcon color="primary" />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            Initial Claim Form.pdf
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            PDF Document &bull; {submissionDate}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item>
                      {fileUrl && (
                        <MuiLink
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'primary.main' }}
                        >
                          <VisibilityOutlinedIcon sx={{ mr: 0.5 }} fontSize="small" />
                          <Typography variant="body2" fontWeight={500}>
                            View
                          </Typography>
                        </MuiLink>
                      )}
                    </Grid>
                  </Grid>
                </Card>
              </CardContent>
            </Card>

            {/* AI Review Card */}
            {reviewResult.label && (
              <Card sx={cardStyle}>
                <CardContent>
                  <Typography variant="h6" sx={sectionTitleStyle}>
                    AI Review
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>Outcome</Typography>
                  <Typography variant="body1" color="text.primary" mb={1}>{reviewResult.label}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>Explanation</Typography> 
                  <Box>
                    {reviewResult.explanation?.map((reason, index) => (
                      <Chip
                        key={index}
                        label={reason}
                        color="warning"
                        variant="outlined"
                        size="small" 
                        sx={{ mr: 1, mb: 1, marginTop:1, borderRadius: '4px', fontWeight: 500, fontSize: '0.9rem' }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4} lg={3}>
            {/* Status Management Card */}
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={sectionTitleStyle}>
                  <GavelOutlinedIcon /> Claim Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>Current Status:</Typography>
                  <Chip
                    label={status}
                    size="medium" 
                    sx={{
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '1rem',
                      ...(status === 'Rejected' && {
                        backgroundColor: '#ffebee',
                        color: '#d32f2f',
                      }),
                      ...(status === 'In Review' && {
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                      }),
                      ...(status === 'Approved' && {
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32',
                      }),
                      ...(status === 'Flagged' && {
                        backgroundColor: '#fffde7',
                        color: '#ff8f00',
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
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleOutlineIcon />}
                      onClick={() => handleOpenDecisionDialog('Approved')}
                      sx={{ flexGrow: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<CancelOutlinedIcon />}
                      onClick={() => handleOpenDecisionDialog('Rejected')}
                      sx={{ flexGrow: 1 }}
                    >
                      Reject
                    </Button>
                  </Box>
                )}
                {status !== 'Flagged' && (
                  <Typography variant="body2" color="text.secondary" mt={3} mb={2}>
                    Claim status is {status}. No actions needed at this time.
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* History Timeline */}
            {renderHistory()}

            {/* Generate Report Button */}
            <Card sx={{ ...cardStyle, mt: 3,p: 2, bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" sx={{ ...sectionTitleStyle, mb: 2 }}>
                  <DescriptionOutlinedIcon /> Download Report
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Button variant="contained" color="primary" fullWidth onClick={handleDownloadReport}>
                  Generate PDF
                </Button>
              </CardContent>
            </Card>
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
      >
        <DialogTitle id="decision-dialog-title">
          {pendingDecision === 'Approved' ? 'Approve Claim' : 'Reject Claim'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="decision-dialog-description" sx={{ mb: 2 }}>
            Are you sure you want to <strong>{pendingDecision?.toLowerCase()}</strong> this claim?
            This action cannot be undone.
          </DialogContentText>
          <TextField
            label="Add comment (optional)"
            multiline
            rows={3}
            fullWidth
            value={insurerComment}
            onChange={(e) => setInsurerComment(e.target.value)}
            placeholder="Please provide reason for your decision..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDecisionDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDecision} 
            color={pendingDecision === 'Approved' ? 'success' : 'error'} 
            variant="contained"
            autoFocus
          >
            {pendingDecision === 'Approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Status Change"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to change the claim status to <strong>{pendingStatus}</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmStatusChange} color="primary" autoFocus variant="contained">
            Confirm
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
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClaimDetails2;