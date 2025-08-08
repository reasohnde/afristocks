// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  role: { type: String, enum: ['USER', 'STARTUP', 'ADMIN'], default: 'USER' },
  verified: { type: Boolean, default: false },
  balance: { type: Number, default: 125000 },
  portfolio: { type: Number, default: 85000 },
  returns: { type: Number, default: 12.5 },
  // Pour les startups
  companyInfo: {
    sector: String,
    country: String,
    city: String,
    description: String,
    logo: String,
    foundedYear: Number,
    employeeCount: Number,
    website: String,
    pitch: String,
    businessPlan: String,
    shares: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
      price: { type: Number, default: 0 }
    }
  },
  documents: {
    administrative: [{
      name: String,
      url: String,
      uploadedAt: Date,
      verified: Boolean
    }],
    financial: [{
      name: String,
      url: String,
      uploadedAt: Date,
      verified: Boolean
    }],
    activity: [{
      name: String,
      url: String,
      uploadedAt: Date,
      verified: Boolean
    }],
    other: [{
      name: String,
      url: String,
      uploadedAt: Date,
      verified: Boolean
    }]
  },
  profileCompletion: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);