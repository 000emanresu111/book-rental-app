const test = require('ava')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const sinon = require('sinon')
const User = require('../../models/User')

process.env.NODE_ENV = 'testing'
const app = require('../../app')

test('Correct user registration returns 201 status code', async (t) => {
  const saveStub = sinon.stub(User.prototype, 'save').resolves()

  const response = await supertest(app)
    .post('/auth/register')
    .send({ username: 'usertest', email: 'user@example.com', password: 'password', tenantId: '123' })

  t.is(response.status, 201)
  t.true(saveStub.calledOnce)

  saveStub.restore()
})

test('Correct user login returns a token', async (t) => {
  const testUser = new User({
    email: 'test@example.com',
    password: await bcrypt.hash('testpassword', 10)
  })

  const findOneStub = sinon.stub(User, 'findOne').resolves(testUser)

  const response = await supertest(app)
    .post('/auth/login')
    .send({ email: 'test@example.com', password: 'testpassword' })

  t.is(response.status, 200)
  t.true(Object.prototype.hasOwnProperty.call(response.body, 'token'))

  findOneStub.restore()
})
