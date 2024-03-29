const mongoose = require('mongoose')

const rentalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  returnDate: {
    type: Date,
    default: null,
    validate: {
      validator: function (value) {
        return value === null || value > Date.now()
      },
      message: 'Return date must be a future date'
    }
  }
})

const Rental = mongoose.model('Rental', rentalSchema)

module.exports = Rental
