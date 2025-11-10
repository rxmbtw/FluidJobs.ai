const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Serve static files from the new-landing directory
app.use(express.static(__dirname));

// Serve the index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 New Landing Page server running at http://localhost:${PORT}`);
});