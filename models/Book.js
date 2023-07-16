const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  quantity: { type: Number, required: true },
  bookstoreId: { type: String, ref: 'Bookstore', required: true, unique: true },
});

module.exports = mongoose.model('Book', bookSchema);
