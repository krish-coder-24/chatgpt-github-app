import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  Fab,
  Badge,
  IconButton,
  Tooltip,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  HealthAndSafetyRounded,
  MonitorHeartRounded,
  PsychologyRounded,
  SummarizeRounded,
  RecordVoiceOverRounded,
  ViewInArRounded,
  NotificationsRounded,
  SettingsRounded
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Import our Baymax components
import Baymax3D from '../components/Baymax/Baymax3D';
import HeartRateMonitor from '../components/Medical/HeartRateMonitor';
import EmotionDetector from '../components/Medical/EmotionDetector';
import ReportSummarizer from '../components/Medical/ReportSummarizer';
import VoiceChat from '../components/AI/VoiceChat';

const ConsultationPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [isBaymaxSpeaking, setIsBaymaxSpeaking] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sessionData, setSessionData] = useState({
    startTime: new Date(),
    heartRateReadings: [],
    emotionHistory: [],
    reportAnalyses: [],
    consultationNotes: []
  });

  // Handle heart rate changes
  const handleHeartRateChange = (newHeartRate) => {
    setHeartRate(newHeartRate);
    
    // Update session data
    setSessionData(prev => ({
      ...prev,
      heartRateReadings: [...prev.heartRateReadings, {
        value: newHeartRate,
        timestamp: new Date()
      }].slice(-50) // Keep last 50 readings
    }));

    // Add notification for abnormal heart rate
    if (newHeartRate > 120) {
      addNotification('High heart rate detected', 'warning');
    } else if (newHeartRate < 50 && newHeartRate > 0) {
      addNotification('Low heart rate detected', 'warning');
    }
  };

  // Handle emotion changes
  const handleEmotionChange = (newEmotion) => {
    setCurrentEmotion(newEmotion);
    
    // Update session data
    setSessionData(prev => ({
      ...prev,
      emotionHistory: [...prev.emotionHistory, {
        emotion: newEmotion,
        timestamp: new Date()
      }].slice(-20) // Keep last 20 emotion readings
    }));

    // Add notification for concerning emotions
    if (newEmotion === 'sad' || newEmotion === 'angry') {
      addNotification(`Detected ${newEmotion} emotion - Baymax is ready to help`, 'info');
    }
  };

  // Handle report analysis
  const handleReportAnalyzed = (analysis) => {
    setSessionData(prev => ({
      ...prev,
      reportAnalyses: [...prev.reportAnalyses, {
        analysis,
        timestamp: new Date()
      }]
    }));

    if (analysis.severity?.level === 'high') {
      addNotification('High priority medical concern detected', 'error');
    }
  };

  // Handle Baymax speaking state
  const handleBaymaxSpeaking = (speaking) => {
    setIsBaymaxSpeaking(speaking);
  };

  // Add notification
  const addNotification = (message, severity = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      severity,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Get Baymax message based on current state
  const getBaymaxMessage = () => {
    if (heartRate > 120) {
      return "I'm monitoring your elevated heart rate. Please take slow, deep breaths.";
    }
    
    if (currentEmotion === 'sad') {
      return "I notice you seem sad. I'm here to listen and provide support.";
    }
    
    if (currentEmotion === 'angry') {
      return "You appear upset. Would you like to talk about what's troubling you?";
    }
    
    if (isBaymaxSpeaking) {
      return "I'm speaking with you right now. How can I help you today?";
    }
    
    return "I am scanning your health status. Everything appears normal.";
  };

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Calculate session statistics
  const getSessionStats = () => {
    const duration = Math.floor((new Date() - sessionData.startTime) / 1000 / 60); // minutes
    const avgHeartRate = sessionData.heartRateReadings.length > 0 
      ? Math.round(sessionData.heartRateReadings.reduce((sum, reading) => sum + reading.value, 0) / sessionData.heartRateReadings.length)
      : 0;
    
    const dominantEmotion = sessionData.emotionHistory.length > 0
      ? sessionData.emotionHistory.reduce((acc, curr) => {
          acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
          return acc;
        }, {})
      : {};
    
    const mostCommonEmotion = Object.keys(dominantEmotion).length > 0
      ? Object.keys(dominantEmotion).reduce((a, b) => dominantEmotion[a] > dominantEmotion[b] ? a : b)
      : 'neutral';

    return {
      duration,
      avgHeartRate,
      mostCommonEmotion,
      totalReadings: sessionData.heartRateReadings.length,
      reportsAnalyzed: sessionData.reportAnalyses.length
    };
  };

  const sessionStats = getSessionStats();

  const tabComponents = [
    {
      label: '3D Baymax',
      icon: <ViewInArRounded />,
      component: (
        <Baymax3D
          speaking={isBaymaxSpeaking}
          emotion={currentEmotion}
          heartRate={heartRate}
          showHeartRate={heartRate > 0}
          message={getBaymaxMessage()}
        />
      )
    },
    {
      label: 'Voice Chat',
      icon: <RecordVoiceOverRounded />,
      component: (
        <VoiceChat
          heartRate={heartRate}
          emotion={currentEmotion}
          onSpeakingChange={handleBaymaxSpeaking}
        />
      )
    },
    {
      label: 'Heart Monitor',
      icon: <MonitorHeartRounded />,
      component: (
        <HeartRateMonitor
          onHeartRateChange={handleHeartRateChange}
        />
      )
    },
    {
      label: 'Emotion Analysis',
      icon: <PsychologyRounded />,
      component: (
        <EmotionDetector
          onEmotionChange={handleEmotionChange}
        />
      )
    },
    {
      label: 'Report Analyzer',
      icon: <SummarizeRounded />,
      component: (
        <ReportSummarizer
          onReportAnalyzed={handleReportAnalyzed}
        />
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <HealthAndSafetyRounded sx={{ fontSize: 40, color: '#74c0fc', mr: 2 }} />
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                  VitalAI Consultation
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Your Personal Healthcare Companion - Inspired by Baymax
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
              <Badge badgeContent={notifications.length} color="error">
                <IconButton>
                  <NotificationsRounded />
                </IconButton>
              </Badge>
              <IconButton>
                <SettingsRounded />
              </IconButton>
            </Box>
          </Box>

          {/* Session Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="primary">
                    {sessionStats.duration}m
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Session Duration
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="error">
                    {sessionStats.avgHeartRate || '--'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg Heart Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="secondary">
                    {sessionStats.mostCommonEmotion}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Dominant Emotion
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="success.main">
                    {sessionStats.reportsAnalyzed}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Reports Analyzed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Current Status */}
          <Box display="flex" gap={1} flexWrap="wrap">
            {heartRate > 0 && (
              <Chip
                icon={<MonitorHeartRounded />}
                label={`Heart Rate: ${heartRate} BPM`}
                color={heartRate > 100 ? 'error' : 'success'}
                variant="outlined"
              />
            )}
            
            <Chip
              icon={<PsychologyRounded />}
              label={`Emotion: ${currentEmotion}`}
              color="secondary"
              variant="outlined"
            />
            
            {isBaymaxSpeaking && (
              <Chip
                icon={<RecordVoiceOverRounded />}
                label="Baymax is speaking"
                color="primary"
                variant="filled"
              />
            )}
          </Box>
        </motion.div>
      </Box>

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            style={{
              position: 'fixed',
              top: 100 + (notifications.indexOf(notification) * 70),
              right: 20,
              zIndex: 1000,
              width: 350
            }}
          >
            <Alert 
              severity={notification.severity}
              onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            >
              {notification.message}
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Content Tabs */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50'
          }}
        >
          {tabComponents.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              sx={{
                minHeight: 60,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500
              }}
            />
          ))}
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {tabComponents[activeTab].component}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Paper>

      {/* Floating Action Button for Emergency */}
      <Tooltip title="Emergency Contact" placement="left">
        <Fab
          color="error"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            bgcolor: '#d32f2f',
            '&:hover': {
              bgcolor: '#b71c1c'
            }
          }}
          onClick={() => {
            addNotification('Emergency services would be contacted in a real implementation', 'error');
          }}
        >
          <HealthAndSafetyRounded />
        </Fab>
      </Tooltip>

      {/* Medical Disclaimer */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Medical Disclaimer:</strong> VitalAI is for informational purposes only and should not replace professional medical advice. 
          In case of emergency, please contact your local emergency services immediately.
        </Typography>
      </Alert>
    </Container>
  );
};

export default ConsultationPage;