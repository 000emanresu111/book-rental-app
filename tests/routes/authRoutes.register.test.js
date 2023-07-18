const test = require('ava')
const supertest = require('supertest')
const sinon = require('sinon')
const User = require('../../models/User')

process.env.NODE_ENV = 'testing'
const app = require('../../app')

let saveStub
let findOneStub

test.beforeEach(() => {
  saveStub = sinon.stub(User.prototype, 'save')
  findOneStub = sinon.stub(User, 'findOne')
})

test.afterEach(() => {
  saveStub.restore()
  findOneStub.restore()
})

test.serial('Correct user registration returns 201 status code', async (t) => {
  const response = await supertest(app)
    .post('/auth/register')
    .send({ username: 'usertest', email: 'user@example.com', password: 'password', tenantId: '123' })

  t.is(response.status, 201)
  t.true(saveStub.calledOnce)
})
