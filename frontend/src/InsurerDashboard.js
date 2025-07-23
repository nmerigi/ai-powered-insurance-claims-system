import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Container, Paper, Grid, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, CircularProgress, Divider,
  Menu, MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  BarChart as BarChartIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase'; 

const InsurerDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
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

  return (
    <Box bgcolor="#f9fafb" minHeight="100vh">
      {/* Header */}
      <Box bgcolor="white" boxShadow={1} px={3} py={2}>
        <Typography variant="h6" fontWeight="bold">ClaimSmart</Typography>
      </Box>

      {/* Main */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={4}>Insurer Dashboard</Typography>

        {/* Control Panel */}
        <Grid container spacing={4} mb={10}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Box sx={{ bgcolor: 'blue.100', p: 1.5, borderRadius: 2, mr: 2 }}>
                  <BarChartIcon color="primary" />
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>Today's Stats</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="body1">Total Claims: {totalClaims}</Typography>
              <Typography variant="body1">In Review: {newClaims}</Typography>
              <Typography variant="body1">Approved: {approvedClaims}</Typography>
              <Typography variant="body1">Rejected: {rejectedClaims}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Box sx={{ bgcolor: 'yellow.100', p: 1.5, borderRadius: 2, mr: 2 }}>
                  <LightbulbIcon sx={{ color: '#f59e0b' }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>AI Summary</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="body1">Flagged Claims: {flaggedClaims}</Typography>
              <Typography variant="body1">Model Accuracy: 85%</Typography>
              <Typography variant="body1">Last Updated: Jul 21</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search & Table */}
        <Paper sx={{ borderRadius: 2 }}>
          <Box px={3} py={2} borderBottom={1} borderColor="divider">
            <Typography variant="h6">Recent Claims</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Overview of the most recent claim submissions.
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={handleFilterClick}
                >
                  {statusFilter === 'All' ? 'Filters' : statusFilter}
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
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Claim ID</TableCell>
                    <TableCell>Claimant</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClaims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No claims found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClaims.map((claim) => (
                      <TableRow key={claim.claimId}>
                        <TableCell>{claim.claimId}</TableCell>
                        <TableCell>{claim.fullName}</TableCell>
                        <TableCell>{claim.createdAt?.toDate().toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={claim.status} 
                            {...getChipProps(claim.status)}
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small" href={`/claim-details2/${claim.id}`}>View</Button>
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
  );
};

export default InsurerDashboard;