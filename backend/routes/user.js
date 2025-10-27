const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.post('/update-role', authenticateToken, (req, res) => {
  const { role } = req.body;
  
  if (!role || !['Admin', 'Candidate'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  
  // Return updated user data
  res.json({
    candidateId: req.user.candidateId,
    email: req.user.email,
    name: req.user.name,
    role: role
  });
});

module.exports = router;