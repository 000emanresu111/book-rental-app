const mongoose = require('mongoose');

const bookstoreSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Bookstore', bookstoreSchema);
