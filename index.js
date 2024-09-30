const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const ApiKey = require('./models/ApiKey'); // Adjust this path if needed

// Load environment variables
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1); // Exit the application if MongoDB URI is not defined
}

console.log('MongoDB URI:', process.env.MONGODB_URI);

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Route to generate API key
app.post('/generate-api-key', async (req, res) => {
  const { userId } = req.body; // Assume user ID is sent in the request body

  // Generate a unique API key
  const apiKey = uuidv4();

  // Save the API key in MongoDB
  const newApiKey = new ApiKey({ key: apiKey, userId });
  
  try {
    await newApiKey.save();
    res.status(201).json({ apiKey });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

// Middleware to validate API key from query parameters
const validateApiKey = async (req, res, next) => {
  const apiKey = req.query.apiKey; // Get the API key from the query parameter
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }
  
  const validKey = await ApiKey.findOne({ key: apiKey });
  if (!validKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next(); // Proceed to the next middleware or route handler
};

// Protect a sample route
app.get('/protected-route', validateApiKey, (req, res) => {
  res.status(200).json({ message: 'You have access to this protected route!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
