const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  title: {
    type: String,
    default: 'Continue to your destination'
  },
  description: {
    type: String,
    default: 'Click the button below to proceed to the page.'
  },
  funnelContent: {
    type: String,
    default: ''
  },
  redirectDelay: {
    type: Number,
    default: 3,
    min: 0,
    max: 10
  },
  clicks: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

linkSchema.index({ createdAt: -1 });
linkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Link', linkSchema);
