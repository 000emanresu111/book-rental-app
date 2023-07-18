const test = require('ava')
const mongoose = require('mongoose')
const User = require('../models/User')

test('User email must be in a valid format', async (t) => {
  const userData = {
    username: 'testuser1',
    email: 'invalid-email',
    password: 'testpassword1',
    tenantId: '1234'
  }

  try {
    await User.create(userData)
    t.fail('Should have thrown a validation error')
  } catch (error) {
    t.is(error.name, 'ValidationError')
    t.true(error.errors.email instanceof mongoose.Error.ValidatorError)
    t.is(error.errors.email.message, 'Email must be in a valid format')
  }
})
