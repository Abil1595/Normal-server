// models/ApiKey.js
const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '30d' }, // Expires after 30 days
});

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

module.exports = ApiKey;
