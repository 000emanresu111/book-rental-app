const test = require('ava')
const sinon = require('sinon')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { registerUser } = require('../../controllers/authController')
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
})

test.serial('registerUser creates a new user and returns a JWT token', async (t) => {
  const hashedPassword = 'hashed_password'
  const user = new User({
    username: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
    tenantId: 'bookstore123'
  })

  saveStub.resolves(user)
  hashStub.withArgs('password123', 10).resolves(hashedPassword)
  signStub.returns('jwt_token')
  findOneStub.resolves(null)

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

  t.true(saveStub.calledOnce)
  t.true(hashStub.calledOnceWithExactly('password123', 10))
  t.true(res.status.calledOnceWithExactly(201))
  t.deepEqual(res.json.args[0], [
    {
      message: 'User registered successfully',
      token: 'jwt_token'
    }
  ])
  t.false(next.called)
})
