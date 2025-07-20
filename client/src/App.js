import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import LoadingScreen from './components/UI/LoadingScreen';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ConsultationPage from './pages/ConsultationPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes with Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultation/:id?"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ConsultationPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HistoryPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Box>
  );
}

// App Layout component for authenticated pages
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {/* Top Navigation */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            mt: { xs: 7, sm: 8 }, // Account for navbar height
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </Box>
      </Box>
    </>
  );
};

export default App;