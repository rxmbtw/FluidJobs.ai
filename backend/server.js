const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('./config/passport');
const { testConnection, setupDatabase } = require('./utils/dbSetup');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Force false for dev to ensure cookies work with OAuth
    httpOnly: false, // Allow client access for debugging
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax' // Allow cross-site for OAuth flow
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'FluidJobs.ai Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      candidates: '/api/candidates',
      profile: '/api/profile'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FluidJobs.ai Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/database', require('./routes/database'));
app.use('/api/candidates', require('./routes/candidates'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/bulk-import', require('./routes/bulkImport'));

// Serve uploaded files with proper headers
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    // Set proper CORS headers for file access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

// Add a test endpoint to check file serving
app.get('/api/test-file-serving', (req, res) => {
  res.json({ 
    message: 'File serving is working',
    uploadsPath: '/uploads',
    backendUrl: process.env.BACKEND_URL || 'http://localhost:8000'
  });
});
// TODO: Add more route imports here
// app.use('/api/jobs', require('./routes/jobs'));
// app.use('/api/ai', require('./routes/gemini'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  
  // Test database connection
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log('🗄️ Database connection successful');
    // Uncomment the next line to setup database schema on first run
    // await setupDatabase();
  }
});

module.exports = app;