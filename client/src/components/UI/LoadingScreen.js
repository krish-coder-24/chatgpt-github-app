import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = 'Loading VitalAI...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        {/* VitalAI Logo/Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ marginBottom: '20px' }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{ color: 'white' }}
          />
        </motion.div>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          VitalAI
        </Typography>
        
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
          Your Personal Medical Professional
        </Typography>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            {message}
          </Typography>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default LoadingScreen;