const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bookstore', required: true }
})

module.exports = mongoose.model('User', UserSchema)
