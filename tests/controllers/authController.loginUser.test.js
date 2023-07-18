const test = require('ava')
const sinon = require('sinon')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { loginUser } = require('../../controllers/authController')
const User = require('../../models/User')

require('dotenv').config({ path: '.env' })

process.env.NODE_ENV = 'testing'

let saveStub
let hashStub
let signStub
let findOneStub

test.beforeEach(() => {
  saveStub = sinon.stub(User.prototype, 'save')
  hashStub = sinon.stub(bcrypt, 'hash')
  signStub = sinon.stub(jwt, 'sign')
  findOneStub = sinon.stub(User, 'findOne')
})

test.afterEach(() => {
  saveStub.restore()
  hashStub.restore()
  signStub.restore()
  findOneStub.restore()
  sinon.restore()
})

test.serial('loginUser should return a JWT token for a valid user', async (t) => {
  const user = new User({
    email: 'test@example.com',
    password: 'hashed_password'
  })

  findOneStub.resolves(user)
  sinon.stub(bcrypt, 'compare').resolves(true)
  signStub.returns('jwt_token')

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

  t.true(findOneStub.calledOnce)
  t.true(findOneStub.calledWithExactly({ email: 'test@example.com' }))
  t.true(bcrypt.compare.calledOnceWithExactly('password123', user.password))
  t.true(signStub.calledOnceWithExactly({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }))
  t.true(res.json.calledOnceWithExactly({ token: 'jwt_token' }))
  t.false(next.called)
})

test.serial('loginUser should respond with 401 if user is not found', async (t) => {
  const email = 'test@example.com'
  const password = 'password123'

  findOneStub.withArgs({ email }).resolves(null)

  const req = {
    body: {
      email,
      password
    }
  }

  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  }

  const next = sinon.spy()

  await loginUser(req, res, next)

  t.true(findOneStub.calledOnceWithExactly({ email }))
  t.true(res.status.calledOnceWith(401))
  t.true(res.json.calledOnceWith({ error: 'Invalid email or password' }))
  t.false(next.called)
})

test.serial('loginUser should respond with 401 if password is invalid', async (t) => {
  const email = 'test@example.com'
  const password = 'password123'

  const user = new User({
    email,
    password: 'hashed_password'
  })

  findOneStub.resolves(user)
  sinon.stub(bcrypt, 'compare').resolves(false)

  const req = {
    body: {
      email,
      password
    }
  }

  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  }

  const next = sinon.spy()

  await loginUser(req, res, next)

  t.true(findOneStub.calledOnceWithExactly({ email }))
  t.true(bcrypt.compare.calledOnceWithExactly(password, user.password))
  t.true(res.status.calledOnceWith(401))
  t.true(res.json.calledOnceWith({ error: 'Invalid email or password' }))
  t.false(next.called)
})

test.serial('loginUser should handle errors and call next middleware', async (t) => {
  const email = 'test@example.com'
  const password = 'password123'
  const error = new Error('Something went wrong')

  findOneStub.rejects(error)

  const req = {
    body: {
      email,
      password
    }
  }

  const res = {}

  const next = sinon.spy()

  await loginUser(req, res, next)

  t.true(findOneStub.calledOnceWithExactly({ email }))
  t.true(next.calledOnceWith(error))
})
