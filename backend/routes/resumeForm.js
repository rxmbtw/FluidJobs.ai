const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Get or create resume form for candidate
router.get('/resume-form', authenticateToken, async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    
    // Get or create resume form
    let resumeForm = await pool.query(
      'SELECT * FROM resume_forms WHERE candidate_id = $1',
      [candidateId]
    );
    
    if (resumeForm.rows.length === 0) {
      resumeForm = await pool.query(
        'INSERT INTO resume_forms (candidate_id) VALUES ($1) RETURNING *',
        [candidateId]
      );
    }
    
    const resumeFormId = resumeForm.rows[0].id;
    
    // Get basic details
    const basicDetails = await pool.query(
      'SELECT * FROM basic_details WHERE resume_form_id = $1',
      [resumeFormId]
    );
    
    // Get contact details
    const contactDetails = await pool.query(
      'SELECT * FROM contact_details WHERE resume_form_id = $1',
      [resumeFormId]
    );
    
    let phoneNumbers = [];
    let emails = [];
    let webLinks = [];
    
    if (contactDetails.rows.length > 0) {
      const contactId = contactDetails.rows[0].id;
      
      // Get phone numbers
      phoneNumbers = await pool.query(
        'SELECT * FROM phone_numbers WHERE contact_detail_id = $1',
        [contactId]
      );
      
      // Get emails
      emails = await pool.query(
        'SELECT * FROM emails WHERE contact_detail_id = $1',
        [contactId]
      );
      
      // Get web links
      webLinks = await pool.query(
        'SELECT * FROM web_links WHERE contact_detail_id = $1',
        [contactId]
      );
    }
    
    res.json({
      success: true,
      data: {
        resumeForm: resumeForm.rows[0],
        basicDetails: basicDetails.rows[0] || null,
        contactDetails: contactDetails.rows[0] || null,
        phoneNumbers: phoneNumbers.rows || [],
        emails: emails.rows || [],
        webLinks: webLinks.rows || []
      }
    });
  } catch (error) {
    console.error('Error fetching resume form:', error);
    res.status(500).json({ error: 'Failed to fetch resume form' });
  }
});

// Save basic details
router.put('/basic-details', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const candidateId = req.user.candidateId;
    const {
      rollNo, firstName, middleName, lastName,
      course, primarySpecialization, gender, dateOfBirth,
      bloodGroup, maritalStatus, medicalHistory,
      disability, knownLanguages, dreamCompany
    } = req.body;
    
    // Get or create resume form
    let resumeForm = await client.query(
      'SELECT id FROM resume_forms WHERE candidate_id = $1',
      [candidateId]
    );
    
    if (resumeForm.rows.length === 0) {
      resumeForm = await client.query(
        'INSERT INTO resume_forms (candidate_id) VALUES ($1) RETURNING id',
        [candidateId]
      );
    }
    
    const resumeFormId = resumeForm.rows[0].id;
    
    // Upsert basic details
    const result = await client.query(
      `INSERT INTO basic_details (
        resume_form_id, roll_no, first_name, middle_name, last_name,
        course, primary_specialization, gender, date_of_birth,
        blood_group, marital_status, medical_history, disability,
        known_languages, dream_company, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)
      ON CONFLICT (resume_form_id) 
      DO UPDATE SET
        roll_no = $2, first_name = $3, middle_name = $4, last_name = $5,
        course = $6, primary_specialization = $7, gender = $8, date_of_birth = $9,
        blood_group = $10, marital_status = $11, medical_history = $12,
        disability = $13, known_languages = $14, dream_company = $15,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        resumeFormId, rollNo, firstName, middleName, lastName,
        course, primarySpecialization, gender, dateOfBirth,
        bloodGroup, maritalStatus, medicalHistory, disability,
        knownLanguages, dreamCompany
      ]
    );
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Basic details saved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving basic details:', error);
    res.status(500).json({ error: 'Failed to save basic details' });
  } finally {
    client.release();
  }
});

// Save contact details
router.put('/contact-details', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const candidateId = req.user.candidateId;
    const {
      primaryPhoneCode, primaryPhone, primaryEmail,
      otherPhones, otherEmails, webLinks,
      currentAddress, addressLine2, country, state, city, postalCode,
      sameAsCurrent
    } = req.body;
    
    // Get or create resume form
    let resumeForm = await client.query(
      'SELECT id FROM resume_forms WHERE candidate_id = $1',
      [candidateId]
    );
    
    if (resumeForm.rows.length === 0) {
      resumeForm = await client.query(
        'INSERT INTO resume_forms (candidate_id) VALUES ($1) RETURNING id',
        [candidateId]
      );
    }
    
    const resumeFormId = resumeForm.rows[0].id;
    
    // Upsert contact details with JSONB arrays
    const contactResult = await client.query(
      `INSERT INTO contact_details (
        resume_form_id, primary_phone_code, primary_phone, primary_email,
        other_phones, other_emails, web_links,
        current_address, address_line2, country, state, city, postal_code,
        same_as_current, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
      ON CONFLICT (resume_form_id)
      DO UPDATE SET
        primary_phone_code = $2, primary_phone = $3, primary_email = $4,
        other_phones = $5, other_emails = $6, web_links = $7,
        current_address = $8, address_line2 = $9, country = $10,
        state = $11, city = $12, postal_code = $13, same_as_current = $14,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        resumeFormId, primaryPhoneCode, primaryPhone, primaryEmail,
        JSON.stringify(otherPhones || []), JSON.stringify(otherEmails || []), JSON.stringify(webLinks || []),
        currentAddress, addressLine2, country, state, city, postalCode,
        sameAsCurrent
      ]
    );
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Contact details saved successfully',
      data: contactResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving contact details:', error);
    res.status(500).json({ error: 'Failed to save contact details' });
  } finally {
    client.release();
  }
});

module.exports = router;
