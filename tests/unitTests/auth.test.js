const test = require('ava')
const jwt = require('jsonwebtoken')
const sinon = require('sinon')
const { authenticateUser } = require('../../utils/auth')
const User = require('../../models/User')

require('dotenv').config({ path: '.env' })

test('authenticateUser middleware sets req.user with authenticated user', async (t) => {
  const userId = 'user123'
  const token = jwt.sign({ userId }, process.env.JWT_SECRET)
  const req = {
    headers: {
      authorization: `Bearer ${token}`
    }
  }
  const res = {}
  const next = sinon.spy()

  const user = new User({ _id: userId })
  sinon.stub(User, 'findById').resolves(user)

  await authenticateUser(req, res, next)

  t.true(User.findById.calledOnce)
  t.is(req.user, user)
  t.true(next.calledOnce)
  t.deepEqual(next.args[0], [])

  User.findById.restore()
})

test('authenticateUser middleware responds with Unauthorized if authorization header is missing', async (t) => {
  const req = {
    headers: {}
  }
  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  }
  const next = sinon.spy()

  await authenticateUser(req, res, next)

  t.true(res.status.calledWith(401))
  t.true(res.json.calledWithMatch({ error: 'Unauthorized' }))
  t.false(next.called)
})

test('authenticateUser middleware responds with Unauthorized if token is invalid', async (t) => {
  const req = {
    headers: {
      authorization: 'Bearer invalid_token'
    }
  }
  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  }
  const next = sinon.spy()

  await authenticateUser(req, res, next)

  t.true(res.status.calledWith(401))
  t.true(res.json.calledWithMatch({ error: 'Unauthorized' }))
  t.false(next.called)
})

test('authenticateUser middleware responds with Unauthorized if token is missing "Bearer"', async (t) => {
  const req = {
    headers: {
      authorization: 'invalid_token'
    }
  }
  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  }
  const next = sinon.spy()

  await authenticateUser(req, res, next)

  t.true(res.status.calledWith(401))
  t.true(res.json.calledWithMatch({ error: 'Unauthorized' }))
  t.false(next.called)
})

test('authenticateUser middleware responds with Unauthorized if token is expired', async (t) => {
  const userId = 'user123'
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '0s' })
  const req = {
    headers: {
      authorization: `Bearer ${token}`
    }
  }
  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  }
  const next = sinon.spy()

  await authenticateUser(req, res, next)

  t.true(res.status.calledWith(401))
  t.true(res.json.calledWithMatch({ error: 'Unauthorized' }))
  t.false(next.called)
})

test('authenticateUser middleware responds with Unauthorized if token signature is invalid', async (t) => {
  const userId = 'user123'
  const token = jwt.sign({ userId }, 'invalid_secret')
  const req = {
    headers: {
      authorization: `Bearer ${token}`
    }
  }
  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  }
  const next = sinon.spy()

  await authenticateUser(req, res, next)

  t.true(res.status.calledWith(401))
  t.true(res.json.calledWithMatch({ error: 'Unauthorized' }))
  t.false(next.called)
})
