const test = require('ava')
const bcrypt = require('bcrypt')
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

test.serial('Correct user login returns a token', async (t) => {
  const testUser = new User({
    email: 'test@example.com',
    password: await bcrypt.hash('testpassword', 10)
  })

  findOneStub.resolves(testUser)

  const response = await supertest(app)
    .post('/auth/login')
    .send({ email: 'test@example.com', password: 'testpassword' })

  t.is(response.status, 200)
  t.true(Object.prototype.hasOwnProperty.call(response.body, 'token'))
})
