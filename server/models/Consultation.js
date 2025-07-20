const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  symptoms: {
    primary: [String],
    secondary: [String],
    duration: String,
    severity: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  vitalSigns: {
    temperature: {
      value: Number,
      unit: { type: String, enum: ['C', 'F'], default: 'C' },
      timestamp: Date
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      timestamp: Date
    },
    heartRate: {
      value: Number,
      timestamp: Date
    },
    oxygenSaturation: {
      value: Number,
      timestamp: Date
    },
    respiratoryRate: {
      value: Number,
      timestamp: Date
    }
  },
  messages: [{
    type: {
      type: String,
      enum: ['user', 'ai', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      confidence: Number,
      responseTime: Number,
      tokens: Number
    }
  }],
  aiAnalysis: {
    preliminaryDiagnosis: [String],
    recommendations: [String],
    urgencyLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'immediate'],
      default: 'medium'
    },
    followUpRequired: {
      type: Boolean,
      default: false
    },
    referralNeeded: {
      type: Boolean,
      default: false
    },
    riskFactors: [String],
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    description: String,
    type: {
      type: String,
      enum: ['image', 'document', 'audio', 'video']
    }
  }],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    helpful: Boolean,
    submittedAt: Date
  },
  duration: {
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    totalMinutes: Number
  },
  followUp: {
    scheduled: {
      type: Boolean,
      default: false
    },
    date: Date,
    notes: String,
    reminderSent: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for consultation duration
consultationSchema.virtual('durationInMinutes').get(function() {
  if (!this.duration.endTime) return null;
  const start = new Date(this.duration.startTime);
  const end = new Date(this.duration.endTime);
  return Math.round((end - start) / (1000 * 60));
});

// Virtual for message count
consultationSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Pre-save middleware to calculate duration
consultationSchema.pre('save', function(next) {
  if (this.duration.endTime && this.duration.startTime) {
    const start = new Date(this.duration.startTime);
    const end = new Date(this.duration.endTime);
    this.duration.totalMinutes = Math.round((end - start) / (1000 * 60));
  }
  next();
});

// Method to add message
consultationSchema.methods.addMessage = function(type, content, metadata = {}) {
  this.messages.push({
    type,
    content,
    metadata
  });
  return this.save();
};

// Method to end consultation
consultationSchema.methods.endConsultation = function() {
  this.status = 'completed';
  this.duration.endTime = new Date();
  return this.save();
};

// Static method to get active consultations for user
consultationSchema.statics.getActiveForUser = function(userId) {
  return this.find({
    user: userId,
    status: 'active'
  }).populate('user', 'profile.firstName profile.lastName');
};

module.exports = mongoose.model('Consultation', consultationSchema);