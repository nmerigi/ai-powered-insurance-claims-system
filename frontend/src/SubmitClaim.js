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
  Divider
} from '@mui/material';
import { UploadFile, Delete, Person, Notifications } from '@mui/icons-material';
import { auth, db,storage } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';



function SubmitClaim() {

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


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const { fullName, email } = userDoc.data();
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
    <Box minHeight="100vh" bgcolor="#f9fafb">
      {/* Header */}
      <Box boxShadow={1} bgcolor="white" py={2} px={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <Box width={32} height={32} bgcolor="primary.main" borderRadius={2} mr={2}></Box>
          <Typography variant="h6" fontWeight="bold">ClaimSmart</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton>
            <Notifications />
          </IconButton>
          <Avatar />
        </Box>
      </Box>

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>Submit a New Claim</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>Fill out the form below to submit your insurance claim.</Typography>

        {/* Progress Bar */}
        <Box mb={4}>
          <LinearProgress variant="determinate" value={calculateProgress()} sx={{ borderRadius: 2, height: 8 }} />
        </Box>

        <Paper elevation={1} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Personal Details</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>Please provide your contact information.</Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleInputChange} required />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Upload Claim Documents</Typography>

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
            <UploadFile fontSize="large" sx={{ color: '#64748b' }} />
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
              <Typography variant="subtitle1" fontWeight={500} mb={2}>Uploaded Files</Typography>
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
          <Button variant="outlined" color="inherit" startIcon={<Person />} onClick={() => navigate('/claimant-dashboard')}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} endIcon={<Person />}>Continue</Button>
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
  );
}

export default SubmitClaim;
