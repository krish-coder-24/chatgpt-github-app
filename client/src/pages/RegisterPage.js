import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    profile: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const profileField = name.replace('profile.', '');
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          [profileField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
              Join VitalAI
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
              Create your account to get started
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="profile.firstName"
                    value={formData.profile.firstName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="profile.lastName"
                    value={formData.profile.lastName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    helperText="Minimum 6 characters"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="profile.dateOfBirth"
                    type="date"
                    value={formData.profile.dateOfBirth}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Gender"
                    name="profile.gender"
                    select
                    value={formData.profile.gender}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mt: 3, mb: 2 }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
            </form>

            <Typography variant="body2" textAlign="center">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#2196f3', textDecoration: 'none' }}>
                Sign in here
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default RegisterPage;