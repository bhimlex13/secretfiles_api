// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

connectDB();

// Import Routes
const storiesRouter = require('./routes/stories');
// Tell the app to use the routes for anything starting with /api/stories
app.use('/api/stories', storiesRouter); 

app.get('/', (req, res) => {
  res.send('Secret Files API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});