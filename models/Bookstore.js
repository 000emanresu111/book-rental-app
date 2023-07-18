const mongoose = require('mongoose')

const bookstoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        return /^[a-zA-Z]+$/.test(value)
      },
      message: 'Name should contain only alphabetic characters'
    }
  }
})

module.exports = mongoose.model('Bookstore', bookstoreSchema)
