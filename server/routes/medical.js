const express = require('express');
const auth = require('../middleware/auth');
const Consultation = require('../models/Consultation');

const router = express.Router();

// @route   GET /api/medical/history
// @desc    Get user's medical consultation history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const consultations = await Consultation.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('title symptoms aiAnalysis duration status createdAt');

    const total = await Consultation.countDocuments({ user: req.user.userId });

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
    console.error('Get medical history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve medical history'
    });
  }
});

// @route   GET /api/medical/consultation/:id
// @desc    Get specific consultation details
// @access  Private
router.get('/consultation/:id', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!consultation) {
      return res.status(404).json({
        status: 'error',
        message: 'Consultation not found'
      });
    }

    res.json({
      status: 'success',
      data: { consultation }
    });

  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve consultation'
    });
  }
});

module.exports = router;