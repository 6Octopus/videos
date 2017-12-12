const mongoose = require('mongoose');

const mongoUri = 'mongodb://localhost:27017/videos';

const db = mongoose.connect(mongoUri, { useMongoClient: true });

module.exports = db;
