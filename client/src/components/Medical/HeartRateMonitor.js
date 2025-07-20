import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import {
  FavoriteRounded,
  VideocamRounded,
  StopRounded,
  TrendingUpRounded,
  MonitorHeartRounded
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HeartRateMonitor = ({ onHeartRateChange, onStatusChange }) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [heartRateHistory, setHeartRateHistory] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [measurementTime, setMeasurementTime] = useState(0);

  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef();
  const intervalRef = useRef();
  const analysisIntervalRef = useRef();
  
  // PPG analysis variables
  const redValuesRef = useRef([]);
  const timestampsRef = useRef([]);
  const measurementStartRef = useRef(0);

  // Heart rate classification
  const getHeartRateStatus = (hr) => {
    if (hr < 60) return { status: 'bradycardia', color: '#64b5f6', text: 'Low' };
    if (hr > 100) return { status: 'tachycardia', color: '#ef5350', text: 'High' };
    if (hr > 80) return { status: 'elevated', color: '#ffb74d', text: 'Elevated' };
    return { status: 'normal', color: '#66bb6a', text: 'Normal' };
  };

  // Initialize camera for heart rate monitoring
  const startMonitoring = async () => {
    try {
      setError('');
      setStatus('initializing');
      setCalibrationProgress(0);

      // Request camera access with specific constraints for PPG
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          frameRate: 30,
          facingMode: 'user'
        }
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      setStatus('calibrating');
      setIsMonitoring(true);
      measurementStartRef.current = Date.now();

      // Start calibration process
      let progress = 0;
      const calibrationInterval = setInterval(() => {
        progress += 2;
        setCalibrationProgress(progress);
        
        if (progress >= 100) {
          clearInterval(calibrationInterval);
          setStatus('measuring');
          startHeartRateAnalysis();
        }
      }, 100);

      // Start measurement timer
      intervalRef.current = setInterval(() => {
        setMeasurementTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Camera access denied. Please allow camera access to measure heart rate.');
      setStatus('error');
      console.error('Camera error:', err);
    }
  };

  // Stop monitoring
  const stopMonitoring = () => {
    setIsMonitoring(false);
    setStatus('idle');
    setMeasurementTime(0);
    setCalibrationProgress(0);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }

    // Reset analysis arrays
    redValuesRef.current = [];
    timestampsRef.current = [];
  };

  // Start PPG analysis
  const startHeartRateAnalysis = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    analysisIntervalRef.current = setInterval(() => {
      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data from center region (fingertip area)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const sampleSize = 100;

      const imageData = ctx.getImageData(
        centerX - sampleSize / 2,
        centerY - sampleSize / 2,
        sampleSize,
        sampleSize
      );

      // Calculate average red channel intensity
      let redSum = 0;
      const pixels = imageData.data;
      
      for (let i = 0; i < pixels.length; i += 4) {
        redSum += pixels[i]; // Red channel
      }

      const avgRed = redSum / (pixels.length / 4);
      const timestamp = Date.now();

      // Store values for analysis
      redValuesRef.current.push(avgRed);
      timestampsRef.current.push(timestamp);

      // Keep only last 10 seconds of data
      const cutoffTime = timestamp - 10000;
      while (timestampsRef.current.length > 0 && timestampsRef.current[0] < cutoffTime) {
        redValuesRef.current.shift();
        timestampsRef.current.shift();
      }

      // Analyze heart rate if we have enough data
      if (redValuesRef.current.length > 150) { // ~5 seconds at 30fps
        const calculatedHR = calculateHeartRate();
        if (calculatedHR > 0) {
          setHeartRate(calculatedHR);
          setHeartRateHistory(prev => {
            const newHistory = [...prev, { time: new Date(), rate: calculatedHR }];
            return newHistory.slice(-20); // Keep last 20 measurements
          });
          
          if (onHeartRateChange) {
            onHeartRateChange(calculatedHR);
          }
        }
      }
    }, 100); // 10fps analysis
  };

  // Calculate heart rate using FFT-like analysis
  const calculateHeartRate = () => {
    const values = redValuesRef.current;
    const timestamps = timestampsRef.current;
    
    if (values.length < 150) return 0;

    // Remove DC component and apply simple smoothing
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const normalized = values.map(v => v - mean);

    // Simple peak detection
    const peaks = [];
    for (let i = 1; i < normalized.length - 1; i++) {
      if (normalized[i] > normalized[i - 1] && normalized[i] > normalized[i + 1]) {
        if (normalized[i] > 0.5) { // Threshold for significant peaks
          peaks.push(timestamps[i]);
        }
      }
    }

    if (peaks.length < 3) return 0;

    // Calculate intervals between peaks
    const intervals = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1]);
    }

    // Calculate average interval and convert to BPM
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60000 / avgInterval);

    // Validate realistic heart rate range
    if (bpm >= 50 && bpm <= 180) {
      return bpm;
    }

    return 0;
  };

  // Chart configuration
  const chartData = {
    labels: heartRateHistory.map((_, index) => index),
    datasets: [
      {
        label: 'Heart Rate (BPM)',
        data: heartRateHistory.map(h => h.rate),
        borderColor: '#e91e63',
        backgroundColor: 'rgba(233, 30, 99, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 40,
        max: 140,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#666',
        },
      },
      x: {
        display: false,
      },
    },
  };

  const hrStatus = getHeartRateStatus(heartRate);

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <MonitorHeartRounded sx={{ mr: 1, color: '#e91e63' }} />
          <Typography variant="h6" component="h2">
            Heart Rate Monitor
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Live Heart Rate Display */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                background: `linear-gradient(45deg, ${hrStatus.color}20, ${hrStatus.color}10)`
              }}
            >
              <FavoriteRounded 
                sx={{ 
                  fontSize: 40, 
                  color: hrStatus.color,
                  animation: heartRate > 0 ? 'heartbeat 1s infinite' : 'none'
                }} 
              />
              <Typography variant="h3" component="div" sx={{ color: hrStatus.color, fontWeight: 'bold' }}>
                {heartRate || '--'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                BPM
              </Typography>
              <Chip 
                label={hrStatus.text} 
                size="small" 
                sx={{ 
                  mt: 1,
                  backgroundColor: hrStatus.color,
                  color: 'white'
                }} 
              />
            </Paper>
          </Grid>

          {/* Status and Controls */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              {!isMonitoring ? (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<VideocamRounded />}
                  onClick={startMonitoring}
                  sx={{ 
                    py: 1.5,
                    background: 'linear-gradient(45deg, #e91e63, #ad1457)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #ad1457, #880e4f)',
                    }
                  }}
                >
                  Start Monitoring
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<StopRounded />}
                  onClick={stopMonitoring}
                  color="error"
                  sx={{ py: 1.5 }}
                >
                  Stop Monitoring
                </Button>
              )}
            </Box>

            {status !== 'idle' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                </Typography>
                
                {status === 'calibrating' && (
                  <LinearProgress 
                    variant="determinate" 
                    value={calibrationProgress} 
                    sx={{ mb: 1 }}
                  />
                )}
                
                {status === 'measuring' && (
                  <Typography variant="body2">
                    Measuring for: {Math.floor(measurementTime / 60)}:{(measurementTime % 60).toString().padStart(2, '0')}
                  </Typography>
                )}
              </Box>
            )}
          </Grid>

          {/* Heart Rate Chart */}
          {heartRateHistory.length > 0 && (
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, height: 200 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Heart Rate Trend
                </Typography>
                <Line data={chartData} options={chartOptions} />
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Hidden video and canvas for processing */}
        <Box sx={{ display: 'none' }}>
          <video ref={videoRef} />
          <canvas ref={canvasRef} />
        </Box>

        {/* Instructions */}
        {isMonitoring && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Instructions:</strong> Place your fingertip gently over the camera lens. 
            Keep still and ensure good lighting for accurate measurements.
          </Alert>
        )}
      </CardContent>

      <style jsx>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </Card>
  );
};

export default HeartRateMonitor;