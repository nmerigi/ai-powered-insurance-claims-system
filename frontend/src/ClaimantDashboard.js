import React, { useState ,useEffect} from 'react';
import { auth, db } from './firebase';
import { getDoc, doc, collection, getDocs } from 'firebase/firestore';
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
  Chip
} from '@mui/material';
import { Notifications as NotificationsIcon, Add as AddIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { FileCopy, HourglassEmpty, CheckCircle, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';


function ClaimantDashboard() {
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState([]);
  const [userName, setUserName] = useState('');



useEffect(() => {
  const  fetchDashboardData = async () => {
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
      setClaims(claimsData); // this feeds the table at the bottom


      const total = claimsData.length;
      const inProgress = claimsData.filter(c => c.status === 'In Review').length;
      const approved = claimsData.filter(c => c.status === 'Approved').length;
      const rejected = claimsData.filter(c => c.status === 'Rejected').length;

      setStats([
        {
          title: 'Total Claims Submitted',
          value: total,
          description: 'Overall claims processed since joining.',
          icon: <FileCopy color="primary" fontSize="small" />,
        },
        {
          title: 'Claims In Progress',
          value: inProgress,
          description: 'Currently under review or awaiting documents.',
          icon: <HourglassEmpty sx={{ color: 'orange' }} fontSize="small" />,
        },
        {
          title: 'Approved Claims',
          value: approved,
          description: 'Claims successfully approved and processed.',
          icon: <CheckCircle sx={{ color: 'green' }} fontSize="small" />,
        },
        {
          title: 'Rejected Claims',
          value: rejected,
          description: 'Claims that could not be approved.',
          icon: <Cancel sx={{ color: 'red' }} fontSize="small" />,
        },
      ]);
    } catch (error) {
      console.error('Error fetching claim stats:', error);
    }
  };
  fetchDashboardData();
  }, []);

  const navigate = useNavigate();

  return (
    <Box minHeight="100vh" bgcolor="#f9fafb">
      {/* Header */}
      <Box boxShadow={1} bgcolor="white" py={2} px={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <Box width={32} height={32} bgcolor="primary.main" borderRadius={2} mr={2}></Box>
          <Typography variant="h6" fontWeight="bold">ClaimSmart</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2} >
          <IconButton color="default">
            <NotificationsIcon />
          </IconButton>
          <Avatar />
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>

        {/* Welcome Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h5" fontWeight={600} mb={1}>
            Welcome back{userName ? `, ${userName}` : ''} 
            </Typography>
            <Typography color="text.secondary">Track your claims and submit new ones</Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            sx={{ borderRadius: 2 }} 
            onClick={() => navigate('/submit-claim')}
          >
            Submit New Claim
          </Button>
        </Box>

        {/* Hero Banner */}
        <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(to right, #ede9fe, #dbeafe)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" fontWeight={700} gutterBottom> 
                Simplify Your Claim, Get It Processed Faster.
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={2}>
                Submit new claims effortlessly and track their progress in real-time.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                sx={{ borderRadius: 2 }} 
                onClick={() => navigate('/submit-claim')}
              >
                Submit New Claim
              </Button>

            </Grid>
            <Grid item md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box width={120} height={120} borderRadius="50%" bgcolor="#c4b5fd" opacity={0.3}></Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Stats */}
        <Grid container spacing={3} mb={4} >
          {stats.map((stat, i) => (
              <Grid item xs={12} sm={6} md={6} lg={3} key={i}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  {stat.icon}
                </Box>
                <Typography variant="subtitle2" color="text.secondary">{stat.title}</Typography>
                <Typography variant="h6" fontWeight={700}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.description}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Recent Claims Table */}
        <Paper elevation={1} sx={{ borderRadius: 2 }}>
          <Box px={3} py={2} borderBottom={1} borderColor="divider" display="flex" justifyContent="space-between">
            <Typography variant="h6">Your Recent Claims</Typography>
            <Button size="small" startIcon={<VisibilityIcon />} sx={{ textTransform: 'none' }}>View All Claims</Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Claim ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date Filed</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">No claims found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  claims.map((claim, index) => (
                    <TableRow
                    key={index}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                      },
                    }}
                    onClick={() => navigate(`/claim/${claim.id}`)} 
                    >
                      <TableCell>{claim.claimId}</TableCell>
                      <TableCell>Outpatient Visit</TableCell>
                      <TableCell>
                        {claim.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={claim.status}
                          color={
                            claim.status === 'Approved' ? 'success' :
                            claim.status === 'Rejected' ? 'error' :
                            'info'
                          }
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
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
  );
}

export default ClaimantDashboard;

