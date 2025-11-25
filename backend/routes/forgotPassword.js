const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send verification code
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const userResult = await pool.query('SELECT candidate_id FROM candidates WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    // Generate 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store code in database
    await pool.query(
      'INSERT INTO password_reset_codes (email, code, expires_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET code = $2, expires_at = $3',
      [email, verificationCode, expiresAt]
    );
    
    // Send email
    await transporter.sendMail({
      from: `"FluidJobs.ai" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'FluidJobs.ai - Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4285F4; margin: 0;">FluidJobs.ai</h1>
            <p style="color: #666; margin: 5px 0;">Password Reset Request</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Your Verification Code</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; border: 2px solid #4285F4;">
              <span style="font-size: 32px; font-weight: bold; color: #4285F4; letter-spacing: 5px;">${verificationCode}</span>
            </div>
            <p style="color: #666; margin-top: 20px; font-size: 14px;">This code will expire in <strong>10 minutes</strong></p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">This email was sent from FluidJobs.ai</p>
          </div>
        </div>
      `
    });
    
    res.json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Verify code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM password_reset_codes WHERE email = $1 AND code = $2 AND expires_at > NOW()',
      [email, code]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    
    res.json({ message: 'Code verified successfully' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    // Verify code again
    const codeResult = await pool.query(
      'SELECT * FROM password_reset_codes WHERE email = $1 AND code = $2 AND expires_at > NOW()',
      [email, code]
    );
    
    if (codeResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query('UPDATE candidates SET password_hash = $1 WHERE email = $2', [hashedPassword, email]);
    
    // Delete used code
    await pool.query('DELETE FROM password_reset_codes WHERE email = $1', [email]);
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;