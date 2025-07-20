import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

const BaymaxFallback = ({ 
  speaking = false, 
  emotion = 'neutral', 
  heartRate = 0, 
  showHeartRate = false,
  message = ""
}) => {
  
  const getEmotionColor = () => {
    if (heartRate > 100) return '#ff6b6b';
    if (heartRate > 80) return '#ffd93d';
    return '#74c0fc';
  };

  const getEmotionEmoji = () => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'surprised': return '😲';
      case 'fear': return '😨';
      case 'concerned': return '😟';
      default: return '😐';
    }
  };

  return (
    <Paper 
      elevation={3}
      sx={{ 
        width: '100%', 
        height: '500px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Heart Rate Particles */}
      {showHeartRate && heartRate > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: heartRate > 100 ? '#ff6b6b' : '#ff8787',
                opacity: 0.7,
                left: `${20 + (i * 10)}%`,
                top: `${30 + Math.sin(i) * 20}%`
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 60 / (heartRate || 70),
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </Box>
      )}

      {/* Baymax Body */}
      <motion.div
        animate={{
          scale: speaking ? [1, 1.05, 1] : [1, 1.02, 1],
          rotate: speaking ? [0, 2, -2, 0] : 0
        }}
        transition={{
          duration: speaking ? 0.5 : 3,
          repeat: Infinity
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 1
        }}
      >
        {/* Head */}
        <motion.div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: getEmotionColor(),
            position: 'relative',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}
          animate={{
            backgroundColor: getEmotionColor()
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Eyes */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              position: 'absolute',
              top: '30%'
            }}
          >
            <motion.div
              style={{
                width: emotion === 'happy' ? 8 : 4,
                height: emotion === 'surprised' ? 12 : 8,
                backgroundColor: '#000',
                borderRadius: emotion === 'happy' ? '50%' : 2
              }}
              animate={{
                scaleY: speaking ? [1, 0.5, 1] : 1,
                rotate: emotion === 'concerned' ? 15 : 0
              }}
              transition={{ duration: 0.3, repeat: speaking ? Infinity : 0 }}
            />
            <motion.div
              style={{
                width: emotion === 'happy' ? 8 : 4,
                height: emotion === 'surprised' ? 12 : 8,
                backgroundColor: '#000',
                borderRadius: emotion === 'happy' ? '50%' : 2
              }}
              animate={{
                scaleY: speaking ? [1, 0.5, 1] : 1,
                rotate: emotion === 'concerned' ? -15 : 0
              }}
              transition={{ duration: 0.3, repeat: speaking ? Infinity : 0 }}
            />
          </Box>
        </motion.div>

        {/* Body */}
        <motion.div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: getEmotionColor(),
            opacity: 0.9,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}
          animate={{
            backgroundColor: getEmotionColor()
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Arms */}
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 15,
            width: 200
          }}
        >
          <motion.div
            style={{
              width: 30,
              height: 80,
              borderRadius: 15,
              backgroundColor: getEmotionColor(),
              opacity: 0.8
            }}
            animate={{
              rotate: speaking ? [-10, 10, -10] : 0,
              backgroundColor: getEmotionColor()
            }}
            transition={{ duration: 1, repeat: speaking ? Infinity : 0 }}
          />
          <motion.div
            style={{
              width: 30,
              height: 80,
              borderRadius: 15,
              backgroundColor: getEmotionColor(),
              opacity: 0.8
            }}
            animate={{
              rotate: speaking ? [10, -10, 10] : 0,
              backgroundColor: getEmotionColor()
            }}
            transition={{ duration: 1, repeat: speaking ? Infinity : 0 }}
          />
        </Box>
      </motion.div>

      {/* Status Display */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 2
        }}
      >
        <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
          {speaking ? '🗣️ Speaking...' : `💝 ${heartRate || '--'} BPM`}
        </Typography>
        <Typography variant="body2" sx={{ color: '#fff', opacity: 0.9 }}>
          {getEmotionEmoji()} {emotion}
        </Typography>
      </Box>

      {/* Message */}
      {message && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '80%',
            textAlign: 'center',
            zIndex: 2
          }}
        >
          <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>
            💬 {message}
          </Typography>
        </Box>
      )}

      {/* Baymax Info */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 60,
          right: 20,
          textAlign: 'right',
          zIndex: 2
        }}
      >
        <Typography variant="caption" sx={{ color: '#fff', opacity: 0.7 }}>
          Baymax Healthcare Companion
        </Typography>
      </Box>
    </Paper>
  );
};

export default BaymaxFallback;