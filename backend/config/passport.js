const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./database');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName;
    
    console.log('🔍 Google OAuth - Email:', email);
    
    // Check if candidate exists by email
    const existingCandidate = await pool.query(
      'SELECT * FROM candidates WHERE email = $1',
      [email]
    );
    
    if (existingCandidate.rows.length > 0) {
      console.log('✅ Existing user found:', existingCandidate.rows[0].candidate_id);
      return done(null, existingCandidate.rows[0]);
    }
    
    console.log('📝 Creating new user...');
    
    // Generate unique candidate ID using timestamp + random
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const candidateId = `FLC${timestamp}${random}`;
    
    console.log('🆔 Generated ID:', candidateId);
    
    // Create new candidate
    const newCandidate = await pool.query(
      `INSERT INTO candidates (
        candidate_id, full_name, email, phone, gender, marital_status, 
        work_status, current_company, notice_period, current_ctc, 
        last_company, previous_ctc, city, work_mode, 
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, '', '', '', '', '', '', NULL, '', NULL, '', '', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *`,
      [candidateId, name, email]
    );
    
    console.log('✅ New user created:', newCandidate.rows[0].candidate_id);
    return done(null, newCandidate.rows[0]);
  } catch (error) {
    console.error('❌ Google OAuth error:', error.message);
    return done(error, null);
  }
}));



passport.serializeUser((user, done) => {
  done(null, user.candidate_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM candidates WHERE candidate_id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;