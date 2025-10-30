const pool = require('../config/database');

const testCandidates = [
  {
    full_name: 'John Doe',
    phone_number: '+1-555-0101',
    email: 'john.doe@example.com',
    gender: 'Male',
    marital_status: 'Single',
    current_company: 'Tech Corp',
    notice_period: '30 days',
    current_ctc: '75000',
    location: 'New York',
    currently_employed: 'Yes',
    previous_company: 'StartupXYZ',
    expected_ctc: '85000',
    experience_years: 3.5
  },
  {
    full_name: 'Jane Smith',
    phone_number: '+1-555-0102',
    email: 'jane.smith@example.com',
    gender: 'Female',
    marital_status: 'Married',
    current_company: 'Innovation Labs',
    notice_period: '60 days',
    current_ctc: '90000',
    location: 'San Francisco',
    currently_employed: 'Yes',
    previous_company: 'BigTech Inc',
    expected_ctc: '100000',
    experience_years: 5.0
  },
  {
    full_name: 'Mike Johnson',
    phone_number: '+1-555-0103',
    email: 'mike.johnson@example.com',
    gender: 'Male',
    marital_status: 'Single',
    current_company: null,
    notice_period: 'Immediate',
    current_ctc: '0',
    location: 'Austin',
    currently_employed: 'Fresher',
    previous_company: null,
    expected_ctc: '60000',
    experience_years: 0
  },
  {
    full_name: 'Sarah Wilson',
    phone_number: '+1-555-0104',
    email: 'sarah.wilson@example.com',
    gender: 'Female',
    marital_status: 'Single',
    current_company: 'Data Solutions',
    notice_period: '45 days',
    current_ctc: '80000',
    location: 'Seattle',
    currently_employed: 'Yes',
    previous_company: 'Analytics Pro',
    expected_ctc: '95000',
    experience_years: 4.2
  },
  {
    full_name: 'David Brown',
    phone_number: '+1-555-0105',
    email: 'david.brown@example.com',
    gender: 'Male',
    marital_status: 'Married',
    current_company: 'Cloud Systems',
    notice_period: '30 days',
    current_ctc: '95000',
    location: 'Boston',
    currently_employed: 'Yes',
    previous_company: 'Enterprise Solutions',
    expected_ctc: '110000',
    experience_years: 6.5
  }
];

async function addTestCandidates() {
  try {
    console.log('Adding test candidates...');
    
    for (const candidate of testCandidates) {
      const query = `
        INSERT INTO candidates (
          full_name, phone_number, email, gender, marital_status,
          current_company, notice_period, current_ctc, location,
          currently_employed, previous_company, expected_ctc, experience_years
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
        RETURNING candidate_id
      `;
      
      const values = [
        candidate.full_name,
        candidate.phone_number,
        candidate.email,
        candidate.gender,
        candidate.marital_status,
        candidate.current_company,
        candidate.notice_period,
        candidate.current_ctc,
        candidate.location,
        candidate.currently_employed,
        candidate.previous_company,
        candidate.expected_ctc,
        candidate.experience_years
      ];
      
      await pool.query(query, values);
      console.log(`✅ Added candidate: ${candidate.full_name}`);
    }
    
    console.log('🎉 All test candidates added successfully!');
    
    // Show total count
    const countResult = await pool.query('SELECT COUNT(*) FROM candidates');
    console.log(`📊 Total candidates in database: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error adding test candidates:', error);
  } finally {
    await pool.end();
  }
}

addTestCandidates();