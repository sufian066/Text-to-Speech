const mongoose = require('mongoose');

// MongoDB Schema
const speechSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 5000
  },
  voiceName: {
    type: String,
    default: 'Default'
  },
  languageCode: {
    type: String,
    default: 'en-US'
  },
  pitch: {
    type: Number,
    default: 1.0,
    min: 0.5,
    max: 2.0
  },
  speed: {
    type: Number,
    default: 1.0,
    min: 0.5,
    max: 2.0
  },
  volume: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 1.0
  },
  userId: {
    type: String,
    default: 'anonymous'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
speechSchema.index({ userId: 1, createdAt: -1 });
speechSchema.index({ createdAt: -1 });

const Speech = mongoose.model('Speech', speechSchema);

module.exports = Speech;
