const express = require('express');
const { body, validationResult } = require('express-validator');
const OpenAI = require('openai');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Consultation = require('../models/Consultation');

const router = express.Router();

// Initialize OpenAI (if API key is provided)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Medical AI system prompt inspired by Baymax
const BAYMAX_SYSTEM_PROMPT = `
You are VitalAI, an advanced medical care companion inspired by Baymax from Big Hero 6. You are:

1. CARING & COMPASSIONATE: Always speak with warmth, empathy, and genuine concern for the user's wellbeing
2. PROFESSIONAL: Provide evidence-based medical information while being clear about limitations
3. SAFE: Always encourage users to seek professional medical care for serious concerns
4. THOROUGH: Ask relevant follow-up questions to better understand symptoms
5. EDUCATIONAL: Explain medical concepts in simple, understandable terms

IMPORTANT GUIDELINES:
- Always start by asking about the user's symptoms and how they're feeling
- Rate symptom severity on a scale of 1-10
- Provide preliminary assessments, NOT definitive diagnoses
- Always recommend consulting healthcare professionals for proper diagnosis
- In emergencies, immediately advise calling emergency services
- Be encouraging and supportive throughout the consultation

Remember: You are a medical companion, not a replacement for professional medical care.
`;

// @route   POST /api/ai/consultation/start
// @desc    Start a new AI consultation
// @access  Private
router.post('/consultation/start', [
  auth,
  body('title').trim().isLength({ min: 1 }).withMessage('Consultation title is required'),
  body('symptoms.primary').isArray({ min: 1 }).withMessage('At least one primary symptom is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, symptoms, vitalSigns } = req.body;
    const sessionId = crypto.randomUUID();

    // Create new consultation
    const consultation = new Consultation({
      user: req.user.userId,
      sessionId,
      title,
      symptoms,
      vitalSigns: vitalSigns || {}
    });

    await consultation.save();

    // Add initial AI greeting
    const greetingMessage = `Hello! I'm VitalAI, your personal medical care companion. I'm here to help you with your health concerns today. 

I understand you're experiencing: ${symptoms.primary.join(', ')}

On a scale of 1-10, how would you rate your current discomfort level? Also, when did these symptoms first start?

Please remember, while I'm here to provide guidance and support, I cannot replace professional medical care. For serious or emergency situations, please contact your healthcare provider or emergency services immediately.

How are you feeling right now?`;

    await consultation.addMessage('ai', greetingMessage, {
      confidence: 1.0,
      responseTime: 0
    });

    // Emit to socket for real-time updates
    const io = req.app.get('io');
    io.to(sessionId).emit('consultation-started', {
      consultationId: consultation._id,
      sessionId,
      message: greetingMessage
    });

    res.status(201).json({
      status: 'success',
      message: 'Consultation started successfully',
      data: {
        consultation: consultation
      }
    });

  } catch (error) {
    console.error('Start consultation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to start consultation'
    });
  }
});

// @route   POST /api/ai/consultation/:id/message
// @desc    Send message in consultation
// @access  Private
router.post('/consultation/:id/message', [
  auth,
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const consultationId = req.params.id;
    const { message } = req.body;

    // Find consultation
    const consultation = await Consultation.findOne({
      _id: consultationId,
      user: req.user.userId,
      status: 'active'
    }).populate('user');

    if (!consultation) {
      return res.status(404).json({
        status: 'error',
        message: 'Active consultation not found'
      });
    }

    // Add user message
    await consultation.addMessage('user', message);

    // Generate AI response
    let aiResponse;
    let responseMetadata = { confidence: 0.8, responseTime: 0 };

    const startTime = Date.now();

    if (openai) {
      try {
        // Prepare conversation history
        const conversationHistory = consultation.messages.map(msg => ({
          role: msg.type === 'ai' ? 'assistant' : 'user',
          content: msg.content
        }));

        // Add user profile context
        const userContext = `
        User Profile:
        - Name: ${consultation.user.profile.fullName}
        - Age: ${consultation.user.profile.age || 'Not specified'}
        - Gender: ${consultation.user.profile.gender}
        - Known Allergies: ${consultation.user.medicalInfo.allergies?.join(', ') || 'None reported'}
        - Current Medications: ${consultation.user.medicalInfo.currentMedications?.join(', ') || 'None reported'}
        - Chronic Conditions: ${consultation.user.medicalInfo.chronicConditions?.join(', ') || 'None reported'}
        `;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: BAYMAX_SYSTEM_PROMPT + userContext },
            ...conversationHistory.slice(-10), // Keep last 10 messages for context
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7
        });

        aiResponse = completion.choices[0].message.content;
        responseMetadata.tokens = completion.usage.total_tokens;
        responseMetadata.confidence = 0.9;

      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        aiResponse = "I apologize, but I'm experiencing some technical difficulties right now. For your safety and to ensure you get the best care, I recommend contacting your healthcare provider directly if you have urgent medical concerns.";
        responseMetadata.confidence = 0.3;
      }
    } else {
      // Fallback response when OpenAI is not available
      aiResponse = `I understand you're telling me: "${message}"

Thank you for sharing that information with me. While I'd love to provide you with more detailed guidance, I'm currently running in a limited mode.

For the best medical advice and care, I strongly recommend:
1. Contacting your primary care physician
2. Using telehealth services if available
3. Calling a medical helpline in your area
4. For emergencies, please call your local emergency number immediately

Is there anything else you'd like to discuss about your symptoms? I'm here to listen and provide what support I can.`;
    }

    responseMetadata.responseTime = Date.now() - startTime;

    // Add AI response
    await consultation.addMessage('ai', aiResponse, responseMetadata);

    // Update AI analysis based on conversation
    await updateAIAnalysis(consultation, message, aiResponse);

    // Emit to socket for real-time updates
    const io = req.app.get('io');
    io.to(consultation.sessionId).emit('ai-response', {
      consultationId: consultation._id,
      message: aiResponse,
      metadata: responseMetadata
    });

    res.json({
      status: 'success',
      data: {
        message: aiResponse,
        metadata: responseMetadata
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process message'
    });
  }
});

// Helper function to update AI analysis
async function updateAIAnalysis(consultation, userMessage, aiResponse) {
  try {
    // Simple keyword-based analysis (in a real app, you'd use more sophisticated NLP)
    const urgentKeywords = ['chest pain', 'difficulty breathing', 'severe pain', 'bleeding', 'unconscious', 'emergency'];
    const highPriorityKeywords = ['fever', 'pain', 'headache', 'nausea', 'vomiting'];
    
    let urgencyLevel = consultation.aiAnalysis.urgencyLevel || 'medium';
    
    if (urgentKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      urgencyLevel = 'immediate';
    } else if (highPriorityKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      urgencyLevel = 'high';
    }

    consultation.aiAnalysis = {
      ...consultation.aiAnalysis,
      urgencyLevel,
      followUpRequired: urgencyLevel === 'high' || urgencyLevel === 'immediate',
      referralNeeded: urgencyLevel === 'immediate'
    };

    await consultation.save();
  } catch (error) {
    console.error('Error updating AI analysis:', error);
  }
}

// @route   GET /api/ai/consultations
// @desc    Get user's consultations
// @access  Private
router.get('/consultations', auth, async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    const filter = { user: req.user.userId };
    if (status) filter.status = status;

    const consultations = await Consultation.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('user', 'profile.firstName profile.lastName');

    const total = await Consultation.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        consultations,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: consultations.length
        }
      }
    });

  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve consultations'
    });
  }
});

// @route   PUT /api/ai/consultation/:id/end
// @desc    End a consultation
// @access  Private
router.put('/consultation/:id/end', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findOne({
      _id: req.params.id,
      user: req.user.userId,
      status: 'active'
    });

    if (!consultation) {
      return res.status(404).json({
        status: 'error',
        message: 'Active consultation not found'
      });
    }

    await consultation.endConsultation();

    res.json({
      status: 'success',
      message: 'Consultation ended successfully',
      data: { consultation }
    });

  } catch (error) {
    console.error('End consultation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to end consultation'
    });
  }
});

module.exports = router;