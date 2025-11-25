const pool = require('../config/database');

// Your correct sample data
const correctData = [
  {
    candidate_id: 'FLC0000000001',
    full_name: 'Nitya Narang',
    phone_number: '+91 87552 01821',
    email: 'nityanarang1999@gmail.com',
    gender: 'Female',
    marital_status: 'Unmarried',
    current_company: 'EPPS Infotech',
    notice_period: '60 Days',
    current_ctc: 850000.00,
    location: 'Mumbai',
    resume_link: 'https://paperform.co/file/s3.amazonaws.com/pf-user-files-01/u-92896/uploads/2025-09-09/pe238hw/Nitya%20resume.pdf?expires=1758023970&signature=eddb4e5385a337acee06db051424de05aba789e9de38d66825bfef4889eae470',
    currently_employed: 'Yes',
    experience_years: 3.7
  },
  {
    candidate_id: 'FLC0000000002',
    full_name: 'Ashish Kumar Chaurasia',
    phone_number: '+91 94810 02924',
    email: 'chaurasiashish@gmail.com',
    gender: 'Male',
    marital_status: 'Unmarried',
    current_company: 'Harjai Computers Pvt Ltd',
    notice_period: 'Currently Serving Notice Period',
    current_ctc: 1080000.00,
    location: 'Pune (Mah) India',
    resume_link: 'https://paperform.co/file/s3.amazonaws.com/pf-user-files-01/u-92896/uploads/2025-09-09/dy23d22/Ashish%20BA%20CV.pdf?expires=1758024622&signature=f0015a0e3303fc3c6d4ca70d0dfb4a5a8f2dc68c589f0676633475ddc923bacc',
    currently_employed: 'Yes',
    experience_years: 4.4
  },
  {
    candidate_id: 'FLC0000000003',
    full_name: 'Amit Shankarrao Thawari',
    phone_number: '+91 82379 79905',
    email: 'amitthawari10@gmail.com',
    gender: 'Male',
    marital_status: 'Married',
    current_company: 'Apmosys Technology Pvt Ltd',
    notice_period: '30 Days',
    current_ctc: 1250000.00,
    location: 'New Mumbai',
    resume_link: 'https://paperform.co/file/s3.amazonaws.com/pf-user-files-01/u-92896/uploads/2025-09-09/wk03h9x/Amit_Thawari_2025-2.pdf?expires=1758025000&signature=bea815ce0eca460de9ac26976dc2e1f5d7b5d2f15a11056ec6bdbf5ff3f1f643',
    currently_employed: 'Yes',
    experience_years: 8.0
  },
  {
    candidate_id: 'FLC0000000004',
    full_name: 'Shantanu Kuntawar',
    phone_number: '+91 94219 73556',
    email: 'shantanukuntawar@gmail.com',
    gender: 'Male',
    marital_status: 'Unmarried',
    current_company: 'Honeybee Tech Solutions',
    notice_period: '30 Days',
    current_ctc: 504000.00,
    location: 'Pune (Mah) India',
    resume_link: 'https://paperform.co/file/s3.amazonaws.com/pf-user-files-01/u-92896/uploads/2025-09-09/o6237bq/Shantanu_Kuntawar_Business_Analyst1.pdf?expires=1758025533&signature=67d997b6097fae7bfd8325391621d6687d3db0f1dd90e8d597879909061d757f',
    currently_employed: 'Yes',
    experience_years: 3.0
  }
];

async function importCorrectData() {
  try {
    console.log('🗑️ Clearing existing data...');
    await pool.query('DELETE FROM candidates');
    
    console.log('📥 Importing correct sample data...');
    
    for (const candidate of correctData) {
      await pool.query(`
        INSERT INTO candidates (
          candidate_id, full_name, phone_number, email, gender, marital_status,
          current_company, notice_period, current_ctc, location, resume_link,
          currently_employed, experience_years
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        candidate.candidate_id,
        candidate.full_name,
        candidate.phone_number,
        candidate.email,
        candidate.gender,
        candidate.marital_status,
        candidate.current_company,
        candidate.notice_period,
        candidate.current_ctc,
        candidate.location,
        candidate.resume_link,
        candidate.currently_employed,
        candidate.experience_years
      ]);
    }
    
    console.log('✅ Sample data imported successfully');
    
    // Verify
    const result = await pool.query('SELECT candidate_id, full_name, email FROM candidates ORDER BY candidate_id');
    console.log('\n📋 Verification:');
    result.rows.forEach(row => {
      console.log(`${row.candidate_id} - ${row.full_name} - ${row.email}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

importCorrectData();