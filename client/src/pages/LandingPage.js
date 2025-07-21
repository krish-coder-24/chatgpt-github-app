import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  HealthAndSafetyRounded,
  PsychologyRounded,
  MonitorHeartRounded,
  SummarizeRounded,
  ArrowForwardRounded,
  SmartToyRounded
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <PsychologyRounded />,
      title: 'AI-Powered Consultations',
      description: 'Get instant medical guidance from our advanced AI companion, inspired by Baymax.',
    },
    {
      icon: <HealthAndSafetyRounded />,
      title: 'Health Monitoring',
      description: 'Track your vital signs, symptoms, and health trends over time.',
    },
    {
      icon: <SmartToyRounded />,
      title: 'Real-time Chat',
      description: 'Chat with VitalAI 24/7 for immediate medical support and guidance.',
    },
    {
      icon: <MonitorHeartRounded />,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and protected with bank-level security.',
    },
    {
      icon: <SummarizeRounded />,
      title: 'Quick Response',
      description: 'Get medical advice in seconds, not hours. Emergency guidance available.',
    },
    {
      icon: <ArrowForwardRounded />,
      title: 'Caring Support',
      description: 'Compassionate AI that truly cares about your wellbeing and health.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Navigation */}
      <Box
        position="fixed"
        elevation={0}
        sx={{ bgcolor: 'transparent', backdropFilter: 'blur(10px)' }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1, color: 'white' }}>
            VitalAI
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')} sx={{ mr: 2 }}>
            Login
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/register')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            Get Started
          </Button>
        </Box>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h2"
                fontWeight="bold"
                gutterBottom
                sx={{ color: 'white', fontSize: { xs: '2.5rem', md: '3.5rem' } }}
              >
                Your Personal Medical Professional
              </Typography>
              <Typography
                variant="h5"
                sx={{ color: 'rgba(255,255,255,0.9)', mb: 4, lineHeight: 1.6 }}
              >
                Meet VitalAI - an advanced medical care companion inspired by Baymax.
                Get instant, caring medical guidance whenever you need it.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  Start Free Consultation
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': { borderColor: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 4,
                  p: 4,
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mb: 2 }}>
                  🏥 VitalAI
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                  "Hello! I am VitalAI, your personal healthcare companion.
                  I am here to help you with your medical concerns and provide caring support 24/7."
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    p: 2,
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    ✓ Available 24/7 ✓ Instant Response ✓ Caring & Professional
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" textAlign="center" fontWeight="bold" gutterBottom>
              Why Choose VitalAI?
            </Typography>
            <Typography
              variant="h6"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
            >
              Advanced AI technology meets compassionate care to provide you with the best medical guidance
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'white',
                          mb: 3,
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Ready to Start?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of users who trust VitalAI for their healthcare needs
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              Get Started - It's Free
            </Button>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;