const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = 5050; // Forced to 5050 for reliability 

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowdo';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('👉 Make sure you have MongoDB installed and running on your machine!');
  });

// Routes
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// Basic Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to FlowDo API' });
});

app.get('/api', (req, res) => {
  res.json({ status: 'OK', message: 'API is reachable!' });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`👉 To connect from a real phone, use: http://<YOUR_COMPUTER_IP>:${PORT}/api`);
});
