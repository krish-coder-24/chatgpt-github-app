import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import { motion } from 'framer-motion';

const ConsultationPage = () => {
  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          VitalAI Consultation
        </Typography>
        
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>🏥</Typography>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Consultation Feature Coming Soon!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              The AI-powered consultation chat will be available here. 
              This will include real-time conversations with VitalAI, 
              symptom assessment, and medical guidance.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Features will include:
              • Real-time chat with VitalAI
              • Symptom analysis and assessment
              • Health recommendations
              • Emergency detection
              • Consultation history
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default ConsultationPage;