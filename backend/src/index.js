// Backend entry point
const express = require('express');

const app = express();

// Middleware
app.use(express.json());

// Routes
const apiRoutes = require('./api');
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
