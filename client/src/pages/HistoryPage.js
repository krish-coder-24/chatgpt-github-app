import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import { motion } from 'framer-motion';

const HistoryPage = () => {
  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Medical History
        </Typography>
        
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>📊</Typography>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              History Feature Coming Soon!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Your consultation history and health trends will be displayed here.
              Track your health journey and review past conversations with VitalAI.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Features will include:
              • Past consultation records
              • Health trend analysis
              • Symptom timeline
              • Treatment recommendations history
              • Downloadable reports
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default HistoryPage;