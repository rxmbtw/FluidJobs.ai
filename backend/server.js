const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { testConnection, setupDatabase } = require('./utils/dbSetup');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FluidJobs.ai Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/database', require('./routes/database'));
// TODO: Add more route imports here
// app.use('/api/auth', require('./routes/auth'));
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