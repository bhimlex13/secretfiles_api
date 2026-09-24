// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;
let connectionPromise;

app.use(cors());
app.use(express.json());



const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log('MongoDB connected successfully'))
      .catch(error => {
        connectionPromise = undefined;
        console.error('MongoDB connection failed:', error.message);
        throw error;
      });
  }

  await connectionPromise;
};

const ensureDatabase = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(503).json({ message: 'Database unavailable' });
  }
};

// Import Routes
const storiesRouter = require('./routes/stories');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');

// Tell the app to use the routes for anything starting with /api/stories
app.use('/api', ensureDatabase);
app.use('/api/stories', storiesRouter); 
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Secret Files API is running');
});

if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch(() => {
      process.exitCode = 1;
    });
}

module.exports = app;