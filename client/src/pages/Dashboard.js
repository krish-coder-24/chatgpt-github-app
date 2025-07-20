import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Paper,
} from '@mui/material';
import {
  Chat,
  History,
  HealthAndSafety,
  TrendingUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Start Consultation',
      description: 'Chat with VitalAI about your health concerns',
      icon: <Chat />,
      action: () => navigate('/consultation'),
      color: 'primary',
    },
    {
      title: 'View History',
      description: 'Review your past consultations and health data',
      icon: <History />,
      action: () => navigate('/history'),
      color: 'secondary',
    },
  ];

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Welcome back, {user?.profile?.firstName}!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            How are you feeling today? I'm here to help with any health concerns.
          </Typography>
        </Box>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    },
                  }}
                  onClick={action.action}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          bgcolor: `${action.color}.main`,
                          color: 'white',
                          mr: 2,
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {action.title}
                        </Typography>
                        <Typography color="text.secondary">
                          {action.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      color={action.color}
                      fullWidth
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Health Overview */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Your Health Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <HealthAndSafety sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6">Health Status</Typography>
                <Typography color="text.secondary">Good</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Chat sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">Consultations</Typography>
                <Typography color="text.secondary">Ready to chat</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                <Typography variant="h6">Health Trends</Typography>
                <Typography color="text.secondary">Stable</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* VitalAI Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Paper 
            sx={{ 
              p: 4, 
              bgcolor: 'primary.main', 
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" gutterBottom>
              🏥 VitalAI
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              "Hello! I am VitalAI, your personal healthcare companion. I am here to help you with your medical concerns and provide caring support 24/7."
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/consultation')}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              Start Your First Consultation
            </Button>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default Dashboard;