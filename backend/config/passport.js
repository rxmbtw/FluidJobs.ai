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
    
    // FIRST: Check if user exists in admin table
    const existingAdmin = await pool.query(
      'SELECT id, email, name, role FROM users WHERE email = $1',
      [email]
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user found:', existingAdmin.rows[0].id);
      const adminUser = {
        candidate_id: existingAdmin.rows[0].id,
        email: existingAdmin.rows[0].email,
        full_name: existingAdmin.rows[0].name || name,
        role: 'Admin'
      };
      return done(null, adminUser);
    }
    
    // SECOND: Check if candidate exists by email
    const existingCandidate = await pool.query(
      'SELECT * FROM candidates WHERE email = $1',
      [email]
    );
    
    if (existingCandidate.rows.length > 0) {
      console.log('✅ Existing candidate found:', existingCandidate.rows[0].candidate_id);
      const candidateUser = { ...existingCandidate.rows[0], role: 'Candidate' };
      return done(null, candidateUser);
    }
    
    console.log('📝 Creating new candidate...');
    
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
    
    console.log('✅ New candidate created:', newCandidate.rows[0].candidate_id);
    const candidateUser = { ...newCandidate.rows[0], role: 'Candidate' };
    return done(null, candidateUser);
  } catch (error) {
    console.error('❌ Google OAuth error:', error.message);
    return done(error, null);
  }
}));



passport.serializeUser((user, done) => {
  done(null, { id: user.candidate_id, role: user.role });
});

passport.deserializeUser(async (obj, done) => {
  try {
    if (obj.role === 'Admin') {
      // Check admin table
      const result = await pool.query('SELECT id as candidate_id, email, name, role FROM users WHERE id = $1', [obj.id]);
      if (result.rows.length > 0) {
        done(null, { ...result.rows[0], role: 'Admin' });
      } else {
        done(null, false);
      }
    } else {
      // Check candidates table
      const result = await pool.query('SELECT * FROM candidates WHERE candidate_id = $1', [obj.id]);
      if (result.rows.length > 0) {
        done(null, { ...result.rows[0], role: 'Candidate' });
      } else {
        done(null, false);
      }
    }
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;