const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./database');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName;
    
    // Check if candidate exists
    const existingCandidate = await pool.query(
      'SELECT * FROM candidates WHERE email = $1',
      [email]
    );
    
    if (existingCandidate.rows.length > 0) {
      // CRITICAL: Don't overwrite existing user data on re-login
      console.log('✅ Existing user found, preserving profile data');
      return done(null, existingCandidate.rows[0]);
    }
    
    // Generate new FLC ID
    const countResult = await pool.query('SELECT COUNT(*) FROM candidates');
    const count = parseInt(countResult.rows[0].count) + 1;
    const candidateId = `FLC${String(count).padStart(10, '0')}`;
    
    // Create new candidate with all required fields initialized
    const newCandidate = await pool.query(
      `INSERT INTO candidates (
        candidate_id, full_name, email, phone, gender, marital_status, 
        work_status, current_company, notice_period, current_ctc, 
        last_company, previous_ctc, city, work_mode, 
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, '', '', '', '', '', '', '', '', '', '', '', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *`,
      [candidateId, name, email]
    );
    
    return done(null, newCandidate.rows[0]);
  } catch (error) {
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