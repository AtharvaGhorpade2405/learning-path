const mongoose = require('mongoose');

const searchCacheSchema = new mongoose.Schema({
  searchQuery: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  directUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '30d', // 30 days TTL
  },
});

const SearchCache = mongoose.model('SearchCache', searchCacheSchema);
module.exports = SearchCache;
