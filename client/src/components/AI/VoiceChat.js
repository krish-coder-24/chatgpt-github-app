import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  MicRounded,
  MicOffRounded,
  VolumeUpRounded,
  VolumeOffRounded,
  SendRounded,
  SmartToyRounded,
  PersonRounded,
  StopRounded
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceChat = ({ heartRate, emotion, onSpeakingChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef();
  const synthRef = useRef();
  const messagesEndRef = useRef();

  // Text-to-speech
  const speakText = useCallback((text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    // Stop any current speech
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;

    // Try to use a more gentle voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.lang.includes('en')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (onSpeakingChange) onSpeakingChange(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onSpeakingChange) onSpeakingChange(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onSpeakingChange) onSpeakingChange(false);
    };

    synthRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [voiceEnabled, onSpeakingChange]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    if (onSpeakingChange) onSpeakingChange(false);
  }, [onSpeakingChange]);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(interimTranscript);

        if (finalTranscript) {
          handleUserMessage(finalTranscript.trim());
          setCurrentTranscript('');
        }
      };

      recognitionRef.current.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Initialize Baymax with greeting
  useEffect(() => {
    setSpeechSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      text: "Hello! I am Baymax, your personal healthcare companion. I am here to help you with any health concerns you may have. How can I assist you today?",
      timestamp: new Date(),
      emotion: 'happy'
    };
    
    setMessages([welcomeMessage]);
    
    // Speak welcome message
    if (voiceEnabled) {
      speakText(welcomeMessage.text);
    }

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      initializeSpeechRecognition();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopSpeaking();
    };
  }, [initializeSpeechRecognition, speakText, stopSpeaking, voiceEnabled]);

  // Start listening
  const startListening = () => {
    if (!speechSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    setError('');
    setIsListening(true);
    stopSpeaking(); // Stop any current speech
    
    try {
      recognitionRef.current?.start();
    } catch (err) {
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  };

  // Stop listening
  const stopListening = () => {
    setIsListening(false);
    setCurrentTranscript('');
    recognitionRef.current?.stop();
  };

  // Handle user message
  const handleUserMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Get AI response
      const aiResponse = await getAIResponse(text);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: aiResponse.text,
        timestamp: new Date(),
        emotion: aiResponse.emotion || 'neutral',
        heartRateComment: aiResponse.heartRateComment
      };

      setMessages(prev => [...prev, aiMessage]);

      // Speak AI response if voice is enabled
      if (voiceEnabled) {
        speakText(aiResponse.text);
      }

    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date(),
        emotion: 'concerned'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get AI response (simplified for demo)
  const getAIResponse = async (userInput) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate contextual response based on user input and health data
    const responses = generateBaymaxResponse(userInput, heartRate, emotion);
    return responses;
  };

  // Generate Baymax-style responses
  const generateBaymaxResponse = (input, heartRate, emotion) => {
    const lowerInput = input.toLowerCase();
    
    // Health-related responses
    if (lowerInput.includes('pain') || lowerInput.includes('hurt')) {
      return {
        text: "I understand you are experiencing pain. On a scale of 1 to 10, how would you rate your pain level? Can you describe where the pain is located and what it feels like? This information will help me provide better assistance.",
        emotion: 'concerned'
      };
    }

    if (lowerInput.includes('heart') || lowerInput.includes('chest')) {
      const hrComment = heartRate > 100 ? 
        `I notice your heart rate is currently ${heartRate} BPM, which is elevated. ` : 
        heartRate > 0 ? `Your heart rate appears to be ${heartRate} BPM, which is within normal range. ` : '';
      
      return {
        text: `${hrComment}Chest discomfort can have many causes. Are you experiencing any shortness of breath, sweating, or radiating pain? If you're having severe chest pain, please seek immediate medical attention.`,
        emotion: 'concerned',
        heartRateComment: true
      };
    }

    if (lowerInput.includes('sad') || lowerInput.includes('depressed') || lowerInput.includes('anxious')) {
      const emotionComment = emotion === 'sad' ? 
        "I can see that you're feeling sad right now. " : 
        emotion === 'angry' ? "I sense you might be upset. " : '';
      
      return {
        text: `${emotionComment}Your mental health is just as important as your physical health. It's okay to feel sad or anxious sometimes. Would you like to talk about what's troubling you? I'm here to listen and provide support.`,
        emotion: 'caring'
      };
    }

    if (lowerInput.includes('fever') || lowerInput.includes('temperature')) {
      return {
        text: "A fever is often a sign that your body is fighting an infection. Have you taken your temperature? Are you experiencing any other symptoms like chills, headache, or muscle aches? I recommend monitoring your temperature and staying hydrated.",
        emotion: 'concerned'
      };
    }

    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return {
        text: "You are very welcome! I am programmed to care for your health and well-being. Is there anything else I can help you with today? Remember, I am always here when you need medical assistance or just someone to talk to.",
        emotion: 'happy'
      };
    }

    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return {
        text: "Hello! I am Baymax, your personal healthcare companion. I am pleased to meet you. How are you feeling today? Is there anything about your health that you would like to discuss?",
        emotion: 'happy'
      };
    }

    // General health advice
    if (lowerInput.includes('tired') || lowerInput.includes('fatigue')) {
      return {
        text: "Fatigue can have many causes, including lack of sleep, stress, or underlying health conditions. Have you been getting adequate rest? Are you experiencing any other symptoms? I recommend maintaining a regular sleep schedule and staying hydrated.",
        emotion: 'caring'
      };
    }

    // Default caring response
    const defaultResponses = [
      "I am here to help with your health and well-being. Can you tell me more about how you're feeling?",
      "Your health is my priority. Please describe any symptoms or concerns you may have.",
      "I want to make sure you are feeling your best. Is there something specific about your health you'd like to discuss?",
      "I am scanning for any health issues. Please let me know if you are experiencing any discomfort or unusual symptoms."
    ];

    return {
      text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      emotion: 'neutral'
    };
  };

  // Send text message
  const sendTextMessage = () => {
    if (textInput.trim()) {
      handleUserMessage(textInput.trim());
      setTextInput('');
    }
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMessageAvatar = (type, emotion) => {
    if (type === 'user') {
      return <PersonRounded sx={{ color: '#1976d2' }} />;
    }
    
    // Baymax avatar with emotion
    const emotionColors = {
      happy: '#4caf50',
      concerned: '#ff9800',
      caring: '#e91e63',
      neutral: '#74c0fc'
    };

    return <SmartToyRounded sx={{ color: emotionColors[emotion] || '#74c0fc' }} />;
  };

  const getMessageTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 2, height: 600 }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <SmartToyRounded sx={{ mr: 1, color: '#74c0fc' }} />
            <Typography variant="h6" component="h2">
              Voice Chat with Baymax
            </Typography>
          </Box>
          
          <Box>
            <IconButton
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              color={voiceEnabled ? 'primary' : 'default'}
              title={voiceEnabled ? 'Voice On' : 'Voice Off'}
            >
              {voiceEnabled ? <VolumeUpRounded /> : <VolumeOffRounded />}
            </IconButton>
            
            {isSpeaking && (
              <IconButton onClick={stopSpeaking} color="error" title="Stop Speaking">
                <StopRounded />
              </IconButton>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!speechSupported && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Speech recognition is not supported in this browser. You can still type messages.
          </Alert>
        )}

        {/* Messages */}
        <Paper 
          elevation={1} 
          sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 1, 
            mb: 2,
            bgcolor: 'grey.50'
          }}
        >
          <List>
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ListItem
                    sx={{
                      flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      mb: 1
                    }}
                  >
                    <ListItemAvatar sx={{ mt: 0.5 }}>
                      <Avatar sx={{ 
                        bgcolor: message.type === 'user' ? '#1976d2' : '#74c0fc',
                        width: 32,
                        height: 32
                      }}>
                        {getMessageAvatar(message.type, message.emotion)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            bgcolor: message.type === 'user' ? '#1976d2' : 'white',
                            color: message.type === 'user' ? 'white' : 'text.primary',
                            borderRadius: 2,
                            ml: message.type === 'user' ? 'auto' : 0,
                            mr: message.type === 'user' ? 0 : 'auto'
                          }}
                        >
                          <Typography variant="body1">
                            {message.text}
                          </Typography>
                          
                          {message.emotion && message.type === 'ai' && (
                            <Chip
                              label={`😊 ${message.emotion}`}
                              size="small"
                              sx={{ mt: 1, mr: 1 }}
                            />
                          )}
                          
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block', 
                              mt: 1,
                              opacity: 0.7
                            }}
                          >
                            {getMessageTime(message.timestamp)}
                          </Typography>
                        </Paper>
                      }
                    />
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isProcessing && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#74c0fc', width: 32, height: 32 }}>
                    <SmartToyRounded />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Paper elevation={1} sx={{ p: 2, maxWidth: '70%', borderRadius: 2 }}>
                      <Box display="flex" alignItems="center">
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          Baymax is thinking...
                        </Typography>
                      </Box>
                    </Paper>
                  }
                />
              </ListItem>
            )}
            
            <div ref={messagesEndRef} />
          </List>
        </Paper>

        {/* Voice recognition indicator */}
        {isListening && (
          <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: '#e3f2fd' }}>
            <Box display="flex" alignItems="center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <MicRounded sx={{ color: '#1976d2', mr: 1 }} />
              </motion.div>
              <Typography variant="body2" color="primary">
                Listening... {currentTranscript && `"${currentTranscript}"`}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Input controls */}
        <Box display="flex" gap={1} alignItems="center">
          <TextField
            fullWidth
            placeholder="Type your message or use voice..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={sendTextMessage} disabled={!textInput.trim()}>
                    <SendRounded />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          {speechSupported && (
            <Button
              variant={isListening ? "contained" : "outlined"}
              color={isListening ? "error" : "primary"}
              onClick={isListening ? stopListening : startListening}
              startIcon={isListening ? <MicOffRounded /> : <MicRounded />}
              disabled={isSpeaking}
            >
              {isListening ? 'Stop' : 'Voice'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default VoiceChat;