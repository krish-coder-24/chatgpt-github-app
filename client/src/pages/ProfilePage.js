import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Your Profile
        </Typography>
        
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>👤</Typography>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Welcome, {user?.profile?.firstName} {user?.profile?.lastName}!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Profile management features are coming soon. 
              You'll be able to update your personal information, 
              medical history, and preferences here.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Features will include:
              • Personal information editing
              • Medical history management
              • Privacy settings
              • Notification preferences
              • Emergency contacts
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default ProfilePage;