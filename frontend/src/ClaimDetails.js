import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  Container
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
} from '@mui/icons-material';

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const ClaimDetails = () => {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

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
    address,
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
        {/* Top Bar - "Claim Details" Title */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Claim Details
          </Typography>
        </Box>

        {/* Main Grid container for the two columns */}
        <Grid container spacing={3}>
          {/* Left Column: Claim Details (main content) */}
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
                        color={status === 'Rejected' ? 'error' : (status === 'In Review' ? 'info' : 'success')}
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
                {/* First Row of Personal Information */}
                <Grid container spacing={12} mb={4}> {/* Adjusted spacing to 3 and added mb */}
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

                {/* Second Row of Personal Information */}
                <Grid container spacing={12} mb={4}> {/* Added mb to separate rows */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Email Address</Typography>
                    <Typography variant="body1" color="text.primary">{email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Policy Number</Typography>
                    <Typography variant="body1" color="text.primary">{policyNumber}</Typography>
                  </Grid>
                  {/* Display Patient Name if different from Claimant's Full Name */}
                  {patientName && patientName !== fullName && ( // Ensure patientName doesn't duplicate fullName
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>Patient Name</Typography>
                      <Typography variant="body1" color="text.primary">{patientName}</Typography>
                    </Grid>
                  )}
                  
                </Grid>

                {/* Third Row of Personal Information */}
                <Grid container spacing={12} mb={3}> {/* mb to separate this section from the next */}
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
                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Date of Treatment</Typography>
                    <Typography variant="body1" color="text.primary">{actualIncidentDate}</Typography>
                  </Grid>
                </Grid>

                {/* Diagnosis & Treatment */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
                            PDF Document &bull; 2024-03-15 10:30 AM
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
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>Explaination</Typography>
                  <Box>
                    {reviewResult.explanation?.map((reason, index) => (
                      <Chip
                        key={index}
                        label={reason}
                        color="warning"
                        variant="outlined"
                        size="large"
                        sx={{ mr: 1, mb: 1,marginTop:1, borderRadius: '4px', fontWeight: 500,fontSize: '0.9rem' }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right Column: Need Help? */}
          <Grid item xs={12} md={4} lg={3} >
            <Card sx={{ ...cardStyle, p: 2, bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" sx={{ ...sectionTitleStyle, mb: 2 }}>
                  <HelpOutlineIcon /> Need Help?
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CallOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Call Support
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      +25412378946
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Email Support
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      support@claimsmart.com
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Business Hours
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      Mon - Fri : 8AM - 5PM
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ClaimDetails;