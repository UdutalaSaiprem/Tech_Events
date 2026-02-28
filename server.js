const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('.'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/techfest_registration';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log('Database URI:', MONGODB_URI);
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('Failed URI:', MONGODB_URI);
  process.exit(1);
});

// Define Schemas
const paymentSchema = new mongoose.Schema({
  payment_mode: String,
  screenshot: String, // Base64 encoded image or file path
  uploaded_at: { type: Date, default: Date.now },
  verified: { type: Boolean, default: true },
  amount: Number
});

const registrationSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  college_name: String,
  college_id: String,
  course_branch: String,
  year_of_study: String,
  gender: String,
  technical_event: String,
  total_fee: {
    type: Number,
    required: true
  },
  payment: paymentSchema,
  transaction_id: String,
  upi_id: String,
  bank_account: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  submitted_at: Date,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
});

const Registration = mongoose.model('Registration', registrationSchema);

// API Routes

// Create new registration
app.post('/api/register', async (req, res) => {
  try {
    console.log('\n=== Registration Request Received ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Request headers:', req.headers);
    
    const {
      full_name,
      email,
      phone,
      college_name,
      college_id,
      course_branch,
      year_of_study,
      gender,
      technical_event,
      total_fee,
      payment_mode,
      screenshot,
      transaction_id,
      upi_id,
      bank_account,
      submitted_at
    } = req.body;

    // Validate required fields
    if (!full_name || !email || !phone || !technical_event) {
      console.log('❌ Validation failed - Missing required fields');
      console.log('Provided:', { full_name, email, phone, technical_event });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: full_name, email, phone, technical_event'
      });
    }

    console.log('✅ Validation passed');
    console.log('Creating registration for:', full_name, '|', email, '|', phone);

    // Remove screenshot from logs if too large
    const screenshotSize = screenshot ? (screenshot.length / 1024).toFixed(2) + ' KB' : 'none';
    console.log('Screenshot size:', screenshotSize);

    const registration = new Registration({
      full_name,
      email,
      phone,
      college_name,
      college_id,
      course_branch,
      year_of_study,
      gender,
      technical_event,
      total_fee: parseInt(total_fee) || 0,
      payment: {
        payment_mode,
        screenshot: screenshot || null, // Store screenshot if provided
        verified: true,
        amount: parseInt(total_fee) || 0
      },
      transaction_id,
      upi_id,
      bank_account,
      submitted_at: submitted_at ? new Date(submitted_at) : new Date(),
      status: 'completed'
    });

    const savedRegistration = await registration.save();
    console.log('✅ Registration saved to MongoDB!');
    console.log('Registration ID:', savedRegistration._id);
    console.log('Document saved:', {
      id: savedRegistration._id,
      name: savedRegistration.full_name,
      email: savedRegistration.email,
      createdAt: savedRegistration.created_at
    });

    return res.status(201).json({
      success: true,
      message: 'Registration saved successfully!',
      registration_id: savedRegistration._id,
      data: savedRegistration
    });
  } catch (error) {
    console.error('❌ Registration Error:', error.message);
    console.error('Error Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error saving registration',
      error: error.message,
      details: error.toString()
    });
  }
});

// Get all registrations
app.get('/api/registrations', async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ created_at: -1 });
    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching registrations',
      error: error.message
    });
  }
});

// Get registration by ID
app.get('/api/registrations/:id', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching registration',
      error: error.message
    });
  }
});

// Get registrations by email
app.get('/api/registrations/email/:email', async (req, res) => {
  try {
    const registrations = await Registration.find({ email: req.params.email });
    
    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching registrations',
      error: error.message
    });
  }
});

// Get payment history for a registration
app.get('/api/registrations/:id/payment-history', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).select('payment full_name email');
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        full_name: registration.full_name,
        email: registration.email,
        payment_history: registration.payment
      }
    });
  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    port: PORT
  });
});

// Test endpoint to view all registrations (for debugging)
app.get('/api/test/registrations', async (req, res) => {
  try {
    const count = await Registration.countDocuments();
    const registrations = await Registration.find().select('-payment.screenshot').sort({ created_at: -1 });
    console.log('\n=== Test Registrations Retrieval ===');
    console.log('Total registrations:', count);
    
    return res.status(200).json({
      success: true,
      total_count: count,
      registrations: registrations
    });
  } catch (error) {
    console.error('Test Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching test data',
      error: error.message
    });
  }
});

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'reg.html'));
});

// Admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB URI: ${MONGODB_URI}`);
});
