const test = require('ava')
const sinon = require('sinon')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { registerUser, loginUser } = require('../../controllers/authController')
const User = require('../../models/User')

require('dotenv').config({ path: '.env' })

process.env.NODE_ENV = 'testing'

test.serial('registerUser creates a new user and returns a JWT token', async (t) => {
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = new User({
    username: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
    tenantId: 'bookstore123'
  })

  const saveStub = sinon.stub(User.prototype, 'save').resolves(user)
  const hashStub = sinon.stub(bcrypt, 'hash').resolves(hashedPassword)
  const signStub = sinon.stub(jwt, 'sign').returns('jwt_token')

  const req = {
    body: {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      tenantId: 'bookstore123'
    }
  }
  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  }
  const next = sinon.spy()

  await registerUser(req, res, next)

  t.true(User.prototype.save.calledOnce)
  t.true(bcrypt.hash.calledOnceWithExactly('password123', 10))
  t.true(res.status.calledOnceWithExactly(201))
  t.deepEqual(res.json.args[0], [
    {
      message: 'User registered successfully',
      token: 'jwt_token'
    }
  ])
  t.false(next.called)

  saveStub.restore()
  hashStub.restore()
  signStub.restore()
})

test.serial('loginUser should return a JWT token for a valid user', async (t) => {
  const user = new User({
    email: 'test@example.com',
    password: await bcrypt.hash('password123', 10)
  })

  sinon.stub(User, 'findOne').resolves(user)
  sinon.stub(bcrypt, 'compare').resolves(true)
  sinon.stub(jwt, 'sign').returns('jwt_token')

  const req = {
    body: {
      email: 'test@example.com',
      password: 'password123'
    }
  }
  const res = {
    json: sinon.spy()
  }
  const next = sinon.spy()

  await loginUser(req, res, next)

  t.true(User.findOne.calledOnce)
  t.true(User.findOne.calledWithExactly({ email: 'test@example.com' }))
  t.true(bcrypt.compare.calledOnceWithExactly('password123', user.password))
  t.true(jwt.sign.calledOnceWithExactly({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }))
  t.true(res.json.calledOnceWithExactly({ token: 'jwt_token' }))
  t.false(next.called)

  User.findOne.restore()
  bcrypt.compare.restore()
  jwt.sign.restore()
})
