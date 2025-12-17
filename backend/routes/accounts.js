const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// Get accounts for logged-in admin
router.get('/my-accounts/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        a.account_id,
        a.account_name,
        a.created_at,
        COUNT(DISTINCT j.id) as openings,
        COUNT(DISTINCT j.created_by_user_id) as users,
        MAX(j.created_at) as last_activity
      FROM accounts a
      INNER JOIN jobs_enhanced j ON j.account_id = a.account_id
      WHERE j.created_by_user_id = $1
      GROUP BY a.account_id, a.account_name, a.created_at
      ORDER BY a.created_at DESC
    `, [adminId]);
    
    const accounts = result.rows.map(row => ({
      name: row.account_name,
      created: new Date(row.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      locations: '',
      openings: parseInt(row.openings),
      completed: 0,
      status: parseInt(row.openings) > 0 ? 'Active' : 'Inactive',
      users: parseInt(row.users),
      lastActivity: row.last_activity ? new Date(row.last_activity).toLocaleString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true 
      }).replace(',', ' :') : 'N/A'
    }));
    
    res.json({ success: true, accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
