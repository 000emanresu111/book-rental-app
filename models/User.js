const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        // checking if the username contains only alphanumeric characters
        return /^[a-zA-Z0-9]+$/.test(value)
      },
      message: 'Username must contain only alphanumeric characters'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        // validate email format
        return /^[\w-]+(\.[\w-]+)*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/.test(value)
      },
      message: 'Email must be in a valid format'
    }
  },
  password: { type: String, required: true },
  tenantId: { type: String, required: true, unique: true }
})

module.exports = mongoose.model('User', UserSchema)
