import React, { useState } from 'react';
import {
  Box, Typography, Container, Paper, Grid, TextField, InputAdornment,
  IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  BarChart as BarChartIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';

const InsurerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const claims = []; // Will be fetched from Firestore

  const filteredClaims = claims.filter(claim =>
    claim.claimant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.claimId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Box sx={{ bgcolor: 'blue.100', p: 1.5, borderRadius: 2, mr: 2 }}>
                  <BarChartIcon color="primary" />
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>Today's Stats</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="text.secondary">New Claims:</Typography>
                <Typography fontWeight={600}>23</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="text.secondary">Processed:</Typography>
                <Typography fontWeight={600}>15</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Flagged:</Typography>
                <Typography fontWeight={600}>8</Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Box sx={{ bgcolor: 'yellow.100', p: 1.5, borderRadius: 2, mr: 2 }}>
                  <LightbulbIcon sx={{ color: '#f59e0b' }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>AI Summary</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="text.secondary">Auto-approved:</Typography>
                <Typography fontWeight={600}>67%</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Flagged for review:</Typography>
                <Typography fontWeight={600}>33%</Typography>
              </Box>
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
              <Button variant="outlined" startIcon={<FilterIcon />}>
                Filters
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Claim ID</TableCell>
                  <TableCell>Claimant</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>AI Flag</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClaims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No claims found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClaims.map((claim) => (
                    <TableRow key={claim.claimId}>
                      <TableCell>{claim.claimId}</TableCell>
                      <TableCell>{claim.fullName}</TableCell>
                      <TableCell>{claim.type}</TableCell>
                      <TableCell>{claim.createdAt}</TableCell>
                      <TableCell>
                        <Chip label={claim.status} color={
                          claim.status === 'Approved' ? 'success' :
                          claim.status === 'Rejected' ? 'error' :
                          'info'
                        } size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip label={claim.aiFlag || 'None'} color={
                          claim.aiFlag === 'Flagged' ? 'warning' : 'default'
                        } size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Button size="small">View Details</Button>
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
};

export default InsurerDashboard;
