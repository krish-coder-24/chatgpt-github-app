import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Grid,
  Paper,
  Chip,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  CameraAltRounded,
  StopRounded,
  PsychologyRounded
} from '@mui/icons-material';
import Webcam from 'react-webcam';

const EmotionDetector = ({ onEmotionChange, onStatusChange }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [modelLoading, setModelLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  const webcamRef = useRef();
  const intervalRef = useRef();
  const modelRef = useRef();
  const canvasRef = useRef();

  // Emotion mapping
  const emotionMap = {
    angry: { label: 'Angry', color: '#f44336', icon: '😠' },
    disgust: { label: 'Disgusted', color: '#4caf50', icon: '🤢' },
    fear: { label: 'Fearful', color: '#9c27b0', icon: '😨' },
    happy: { label: 'Happy', color: '#4caf50', icon: '😊' },
    sad: { label: 'Sad', color: '#2196f3', icon: '😢' },
    surprise: { label: 'Surprised', color: '#ff9800', icon: '😲' },
    neutral: { label: 'Neutral', color: '#757575', icon: '😐' }
  };

  // Load emotion detection model
  const loadModel = async () => {
    try {
      setModelLoading(true);
      setStatus('loading_model');
      
      // For demo purposes, we'll use a simplified emotion detection
      // In production, you would load a pre-trained emotion detection model
      // modelRef.current = await tf.loadLayersModel('/models/emotion-model.json');
      
      // Simulate model loading
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setModelLoading(false);
      setStatus('model_loaded');
      return true;
    } catch (err) {
      setError('Failed to load emotion detection model');
      setModelLoading(false);
      setStatus('error');
      return false;
    }
  };

  // Start emotion detection
  const startDetection = async () => {
    try {
      setError('');
      
      if (!modelRef.current) {
        const loaded = await loadModel();
        if (!loaded) return;
      }

      setIsActive(true);
      setStatus('detecting');
      
      // Start detection loop
      intervalRef.current = setInterval(() => {
        detectEmotion();
      }, 500); // Analyze every 500ms

    } catch (err) {
      setError('Failed to start emotion detection');
      setStatus('error');
    }
  };

  // Stop emotion detection
  const stopDetection = () => {
    setIsActive(false);
    setStatus('idle');
    setFaceDetected(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Detect emotion from webcam frame
  const detectEmotion = async () => {
    if (!webcamRef.current || !isActive) return;

    try {
      const video = webcamRef.current.video;
      if (!video || video.readyState !== 4) return;

      // Create canvas for processing
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simplified emotion detection (in production, use actual ML model)
      const detectedEmotion = await analyzeImageForEmotion(imageData);
      
      if (detectedEmotion) {
        setFaceDetected(true);
        setCurrentEmotion(detectedEmotion.emotion);
        setEmotionConfidence(detectedEmotion.confidence);
        
        // Update emotion history
        setEmotionHistory(prev => {
          const newHistory = [...prev, {
            emotion: detectedEmotion.emotion,
            confidence: detectedEmotion.confidence,
            timestamp: Date.now()
          }];
          return newHistory.slice(-10); // Keep last 10 detections
        });

        if (onEmotionChange) {
          onEmotionChange(detectedEmotion.emotion);
        }
      } else {
        setFaceDetected(false);
      }

    } catch (err) {
      console.error('Emotion detection error:', err);
    }
  };

  // Simplified emotion analysis (replace with actual ML model)
  const analyzeImageForEmotion = async (imageData) => {
    // This is a simplified demo version
    // In production, you would use TensorFlow.js with a trained emotion model
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate face detection and emotion analysis
        const emotions = ['happy', 'sad', 'angry', 'surprise', 'fear', 'neutral'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        const confidence = 0.7 + Math.random() * 0.3; // 70-100% confidence
        
        // Check if we detect a face (simplified)
        const faceDetected = Math.random() > 0.3; // 70% chance of face detection
        
        if (faceDetected) {
          resolve({
            emotion: randomEmotion,
            confidence: confidence
          });
        } else {
          resolve(null);
        }
      }, 100);
    });
  };

  // Get emotion statistics
  const getEmotionStats = () => {
    if (emotionHistory.length === 0) return {};
    
    const counts = {};
    emotionHistory.forEach(item => {
      counts[item.emotion] = (counts[item.emotion] || 0) + 1;
    });
    
    const total = emotionHistory.length;
    const stats = {};
    Object.keys(counts).forEach(emotion => {
      stats[emotion] = Math.round((counts[emotion] / total) * 100);
    });
    
    return stats;
  };

  const emotionStats = getEmotionStats();
  const currentEmotionData = emotionMap[currentEmotion] || emotionMap.neutral;

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, []);

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <PsychologyRounded sx={{ mr: 1, color: '#9c27b0' }} />
          <Typography variant="h6" component="h2">
            Emotion Detection
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Camera Feed */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle1" gutterBottom>
                Live Camera Feed
              </Typography>
              
              {isActive ? (
                <Box position="relative">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    width="100%"
                    height="auto"
                    screenshotFormat="image/jpeg"
                    style={{ borderRadius: '8px' }}
                  />
                  
                  {/* Face detection indicator */}
                  <Box
                    position="absolute"
                    top={10}
                    right={10}
                    display="flex"
                    alignItems="center"
                  >
                    <Chip
                      label={faceDetected ? "Face Detected" : "No Face"}
                      size="small"
                      color={faceDetected ? "success" : "default"}
                      variant="filled"
                    />
                  </Box>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    height: 200, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                    borderRadius: 1
                  }}
                >
                  <Typography color="text.secondary">
                    Camera feed will appear here
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 2 }}>
                {!isActive ? (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={modelLoading ? <CircularProgress size={20} /> : <CameraAltRounded />}
                    onClick={startDetection}
                    disabled={modelLoading}
                    sx={{ 
                      py: 1.5,
                      background: 'linear-gradient(45deg, #9c27b0, #673ab7)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #673ab7, #3f51b5)',
                      }
                    }}
                  >
                    {modelLoading ? 'Loading Model...' : 'Start Detection'}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<StopRounded />}
                    onClick={stopDetection}
                    color="error"
                    sx={{ py: 1.5 }}
                  >
                    Stop Detection
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Emotion Results */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Emotion
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontSize: '4rem',
                    mb: 1
                  }}
                >
                  {currentEmotionData.icon}
                </Typography>
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: currentEmotionData.color,
                    fontWeight: 'bold',
                    mb: 1
                  }}
                >
                  {currentEmotionData.label}
                </Typography>
                
                {emotionConfidence > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Confidence: {Math.round(emotionConfidence * 100)}%
                  </Typography>
                )}
              </Box>

              {emotionConfidence > 0 && (
                <LinearProgress
                  variant="determinate"
                  value={emotionConfidence * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: currentEmotionData.color,
                    },
                  }}
                />
              )}
            </Paper>
          </Grid>

          {/* Emotion Statistics */}
          {Object.keys(emotionStats).length > 0 && (
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Emotion Distribution (Last 10 detections)
                </Typography>
                
                <Grid container spacing={2}>
                  {Object.entries(emotionStats).map(([emotion, percentage]) => {
                    const emotionData = emotionMap[emotion];
                    return (
                      <Grid item xs={6} sm={4} md={3} key={emotion}>
                        <Box textAlign="center">
                          <Typography variant="h6">
                            {emotionData.icon}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ color: emotionData.color, fontWeight: 'bold' }}
                          >
                            {emotionData.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {percentage}%
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Status indicator */}
        {status !== 'idle' && (
          <Alert 
            severity={status === 'error' ? 'error' : 'info'} 
            sx={{ mt: 2 }}
          >
            Status: {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
            {modelLoading && <CircularProgress size={16} sx={{ ml: 1 }} />}
          </Alert>
        )}

        {/* Instructions */}
        {isActive && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Instructions:</strong> Look directly at the camera for optimal emotion detection. 
            Ensure good lighting and keep your face visible in the frame.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EmotionDetector;